import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "../utils/AppError";

const router = Router();

// Mock user data (in real app, this would be in a database)
const users = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date("2023-01-01"),
    profile: {
      firstName: "Admin",
      lastName: "User",
      avatar: "https://via.placeholder.com/150",
      bio: "System administrator",
    },
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    createdAt: new Date("2023-01-02"),
    profile: {
      firstName: "Regular",
      lastName: "User",
      avatar: "https://via.placeholder.com/150",
      bio: "Application user",
    },
  },
];

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Validation schema
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  profile: Joi.object({
    firstName: Joi.string().min(2).max(25),
    lastName: Joi.string().min(2).max(25),
    bio: Joi.string().max(500),
    avatar: Joi.string().uri(),
  }),
});

// GET /api/users - Get all users (admin only)
router.get(
  "/",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role !== "admin") {
        throw new AppError("Access denied. Admin privileges required.", 403);
      }

      const sanitizedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.profile,
      }));

      res.json({
        success: true,
        data: sanitizedUsers,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/profile - Get current user profile
router.get(
  "/profile",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = users.find((u) => u.id === req.user?.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          profile: user.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id - Get user by ID
router.get(
  "/:id",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Users can only access their own data unless they're admin
      if (req.user?.id !== id && req.user?.role !== "admin") {
        throw new AppError("Access denied.", 403);
      }

      const user = users.find((u) => u.id === id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          profile: user.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/users/:id - Update user
router.put(
  "/:id",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Users can only update their own data unless they're admin
      if (req.user?.id !== id && req.user?.role !== "admin") {
        throw new AppError("Access denied.", 403);
      }

      const { error } = updateUserSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new AppError("User not found", 404);
      }

      // Update user data
      const { name, profile } = req.body;
      if (name) users[userIndex].name = name;
      if (profile)
        users[userIndex].profile = { ...users[userIndex].profile, ...profile };

      res.json({
        success: true,
        data: {
          id: users[userIndex].id,
          email: users[userIndex].email,
          name: users[userIndex].name,
          role: users[userIndex].role,
          createdAt: users[userIndex].createdAt,
          profile: users[userIndex].profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete(
  "/:id",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role !== "admin") {
        throw new AppError("Access denied. Admin privileges required.", 403);
      }

      const { id } = req.params;
      const userIndex = users.findIndex((u) => u.id === id);

      if (userIndex === -1) {
        throw new AppError("User not found", 404);
      }

      // Don't allow deleting yourself
      if (req.user.id === id) {
        throw new AppError("Cannot delete your own account", 400);
      }

      users.splice(userIndex, 1);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
