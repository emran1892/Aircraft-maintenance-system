import { Request, Response } from "express";
import { registerUserService, loginUserService, adminCreateUserService, getAllEngineersService } from "./auth.service";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body;
        const savedUser = await registerUserService(userData);
        res.status(201).json({ message: "User created!", user: savedUser });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};



export const loginUser = async (req: Request, res: Response) => {
    try {

        //  1: Get email and password from the request body
        const loginData = req.body;


        //  2: Call the loginUserService and pass loginData
        const result = await loginUserService(loginData);


        //  3: Send the success response back to the frontend with the result from the service (which includes user info and token)
        res.status(200).json({ message: "Login successful!", data: result });

    } catch (error: any) {
        // If login fails (wrong email/password), it will catch the error here
        res.status(401).json({ message: error.message });
    }
};

export const adminCreateUser = async (req: Request, res: Response) => {
    try {
        const userinfo = req.body;
        const savedUser = await adminCreateUserService(userinfo);
        res.status(201).json({ message: "New employee account created successfully by Admin!", user: savedUser });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const getAllEngineers = async (req: Request, res: Response) => {
    try {
        const engineers = await getAllEngineersService();
        res.status(200).json({
            message: "Engineers list retrieved successfully!",
            data: engineers
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};