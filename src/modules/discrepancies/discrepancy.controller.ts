import { Router, Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createDiscrepancyService, getAllDiscrepanciesService, assignOrClaimTaskService, resolveDiscrepancyService } from "./discrepancy.service";




export const createDiscrepancy = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, aircraft_id, duration_required } = req.body;

        // after token verification and authentication, req.user will have the user data (id and role)
        const checkerId = req.user?.id;

        if (!checkerId) {
            return res.status(401).json({ message: "Unauthorized. Checker not found in token." });
        }

        // passing data to the service to create a new discrepancy
        const discrepancy = await createDiscrepancyService(
            title,
            description,
            aircraft_id,
            checkerId,
            duration_required,
        );

        res.status(201).json({
            message: "Discrepancy card created successfully!",
            data: discrepancy
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};



export const getAllDiscrepancies = async (req: Request, res: Response) => {
    try {
        const cards = await getAllDiscrepanciesService();
        res.status(200).json({ data: cards });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};





export const assignOrClaimTask = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam; // ensure string for service call
        if (!id) {
            return res.status(400).json({ message: "Discrepancy Card ID is required in the URL." });
        }

        const userRole = req.user?.role;
        const userId = req.user?.id;

        let targetEngineerId: string;

        if (userRole === "admin") {
            // If Admin, get the engineer ID from the request body
            if (!req.body.engineer_id) {
                return res.status(400).json({ message: "Admin must provide 'engineer_id' in the body to assign this task." });
            }
            targetEngineerId = req.body.engineer_id;
        } else if (userRole === "engineer") {
            // If Engineer, they are claiming the task for themselves
            if (!userId) return res.status(401).json({ message: "Unauthorized. Engineer ID missing." });
            targetEngineerId = userId;
        } else {
            return res.status(403).json({ message: "Access denied. Only Admins and Engineers can process tasks!" });
        }

        // Call the service layer to process assignment/claim
        const updatedCard = await assignOrClaimTaskService(id, targetEngineerId);

        res.status(200).json({
            message: userRole === "admin" ? "Task successfully assigned to the engineer!" : "Task successfully claimed by you!",
            data: updatedCard
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};




export const resolveDiscrepancy = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.id; // Discrepancy Card ID from URL (may be string | string[])
        const id = Array.isArray(idParam) ? idParam[0] : idParam;
        if (!id) return res.status(400).json({ message: "Discrepancy Card ID is required in the URL." });
        const engineerId = req.user?.id;

        if (!engineerId || req.user?.role !== "engineer") {
            return res.status(403).json({ message: "Access denied. Only the assigned Engineer can resolve this task!" });
        }

        const result = await resolveDiscrepancyService(id, engineerId);

        res.status(200).json({
            message: "Success! Task resolved and aircraft is now FULLY SERVICEABLE to fly! ✈️",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};