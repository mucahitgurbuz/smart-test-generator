import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { AppError } from "../utils/AppError";

const router = Router();

// Mock user data (in real app, this would be in a database)
const users = [
  {
    id: "1",
    email: "admin@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    role: "admin",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    role: "user",
  },
];

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

// POST /api/auth/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const { email, password } = req.body;

      // Find user
      const user = users.find((u) => u.email === email);
      if (!user) {
        throw new AppError("Invalid credentials", 401);
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new AppError("Invalid credentials", 401);
      }

      // Generate JWT
      const jwtSecret = process.env.JWT_SECRET || "default-secret-key";
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        throw new AppError("User already exists", 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        id: String(users.length + 1),
        email,
        password: hashedPassword,
        role: "user",
      };

      users.push(newUser);

      // Generate JWT
      const jwtSecret = process.env.JWT_SECRET || "default-secret-key";
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        jwtSecret,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
