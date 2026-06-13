import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// We are extending the Express Request interface to hold user data inside "req.user"
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Get the token from the request header (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    // Split the header to get only the token string (removing the word "Bearer")
    const token = authHeader.split(" ")[1];

    try {
        //  1: Verify the token using jwt.verify
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

        //  2: Attach the decoded user data (id and role) to the req.user object
        req.user = { id: decoded.id, role: decoded.role };

        // Go to the next controller function
        next();
    } catch (error) {
        // If token is fake or expired
        res.status(403).json({ message: "Invalid or expired token." });
    }
};