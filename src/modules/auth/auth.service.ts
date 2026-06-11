import { AppDataSource } from "../../config/data-source";
import { User, UserRole } from "../users/user.entity";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUserService = async (userData: any) => {
    const userRepository = AppDataSource.getRepository(User);
    const { name, email, password } = userData;

    // 1. Email check
    const existingUser = await userRepository.findOne({ where: { email: email } });
    if (existingUser) {
        throw new Error("Email already in use!");
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create new user
    const newUser = userRepository.create({
        name,
        email,
        password: hashedPassword
    });

    // 4. Save to database and return
    const savedUser = await userRepository.save(newUser);
    return savedUser;
};


export const loginUserService = async (loginData: any) => {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password } = loginData;
    const user = await userRepository.findOne({ where: { email } });

    // If user is not found, throw an error
    if (!user) {
        throw new Error("Invalid email or password!");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // If password does not match, throw an error
    if (!isPasswordMatch) {
        throw new Error("Invalid email or password!");
    }

    // Generate JWT Token for authentication
    // Inside the token, we are hiding user id and their role
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1d" } // Token will expire in 1 day
    );

    // Return the user info and the secure token
    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
    };
};

export const adminCreateUserService = async (userData: any) => {
    const userRepository = AppDataSource.getRepository(User);
    const { name, email, password, role } = userData;

    // 1.check emrail
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        throw new Error("User with this email already exists!");
    }

    // 2. validate role
    if (!Object.values(UserRole).includes(role)) {
        throw new Error("Invalid role! Use 'admin', 'engineer', or 'checker'.");
    }

    // 3. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. create new user
    const newUser = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role: role as UserRole // admin's provided role will be used here
    });

    const savedUser = await userRepository.save(newUser);

    // return the user info without password
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
};


