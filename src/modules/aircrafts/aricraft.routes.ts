import { Router, Response, NextFunction } from "express";
import { createAircraft, getAircraftById, getAllAircrafts, updateAircraftStatus, } from "./aircraft.controller";
import { authMiddleware, AuthRequest } from "../../middleware/auth.middleware";

const aircraftRouter = Router();

// This middleware will check if the user is authenticated and has the "admin" role
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    // after authentication, req.user will have the user data (id and role)
    if (req.user && req.user.role === "admin") {
        next(); // if the role is admin, allow access
    } else {
        res.status(403).json({ message: "Access denied. Admins only!" }); // otherwise, deny access
    }
};

aircraftRouter.post("/create", authMiddleware, isAdmin, createAircraft);
aircraftRouter.get("/all", authMiddleware, getAllAircrafts);
aircraftRouter.get("/:id", authMiddleware, getAircraftById);
aircraftRouter.patch("/:id/status", authMiddleware, updateAircraftStatus);


export default aircraftRouter;