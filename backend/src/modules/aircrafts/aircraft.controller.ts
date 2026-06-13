import { Request, Response } from "express";
import { createAircraftService, getAllAircraftsService, getAircraftByIdService, updateAircraftStatusService } from "./aircraft.service";

export const createAircraft = async (req: Request, res: Response) => {
    try {
        const aircraftData = req.body;
        const savedAircraft = await createAircraftService(aircraftData);
        res.status(201).json({ message: "Aircraft created!", aircraft: savedAircraft });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// 1. Get All Controller
export const getAllAircrafts = async (req: Request, res: Response) => {
    try {
        const aircrafts = await getAllAircraftsService();
        res.status(200).json({ data: aircrafts });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get By ID Controller
export const getAircraftById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params; // URL থেকে ID নেওয়া হলো
        const aircraft = await getAircraftByIdService(id);
        res.status(200).json({ data: aircraft });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const updateAircraftStatus = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // from fontend

        // status validation
        if (status !== "fully_serviceable" && status !== "aog") {
            return res.status(400).json({ message: "Invalid status value! Use 'fully_serviceable' or 'aog'." });
        }

        const updatedAircraft = await updateAircraftStatusService(id, status);
        res.status(200).json({ message: "Aircraft status updated successfully!", aircraft: updatedAircraft });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};






