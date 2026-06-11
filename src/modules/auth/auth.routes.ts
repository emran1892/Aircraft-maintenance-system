import { NextFunction, Router, Response } from "express";
import { registerUser, loginUser, adminCreateUser } from "./auth.controller";
import { authMiddleware, AuthRequest } from "../../middleware/auth.middleware";

const authRouter = Router();

// Middleware guard to check if the logged-in user is an Admin
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    // After authentication, req.user will contain the user data (id and role)
    if (req.user && req.user.role === "admin") {
        next(); // If the role is admin, allow access to the next function
    } else {
        res.status(403).json({ message: "Access denied. Admins only!" }); // Otherwise, block access
    }
};

// Public authentication routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

// Secure route: Admin can manually onboard new employees (Engineers or Checkers)
authRouter.post("/create-user", authMiddleware, isAdmin, adminCreateUser);

export default authRouter;