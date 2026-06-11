import { Router, Response, NextFunction } from "express";
import { createDiscrepancy, getAllDiscrepancies, assignOrClaimTask, resolveDiscrepancy } from "./discrepancy.controller";
import { authMiddleware, AuthRequest } from "../../middleware/auth.middleware";

const discrepancyRouter = Router();

// only checkers and admins can report problems, so we create a middleware to check the role
const isChecker = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === "checker" || req.user.role === "admin")) {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Only Checkers and Admins can report problems!" });
    }
};

//Firsty check authentication user then checker or admin role and then allow to create discrepancy
discrepancyRouter.post("/report", authMiddleware, isChecker, createDiscrepancy);
discrepancyRouter.get("/all", authMiddleware, getAllDiscrepancies);
discrepancyRouter.patch("/:id/assign", authMiddleware, assignOrClaimTask);
discrepancyRouter.patch("/:id/resolve", authMiddleware, resolveDiscrepancy);

export default discrepancyRouter;