import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { Database } from "./database";
import { logger } from "./utils/logger";
import projectRoutes from "./routes/projects";
import testRoutes from "./routes/tests";
import analysisRoutes from "./routes/analysis";
import settingsRoutes from "./routes/settings";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Request parsing middleware
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply rate limiting
app.use("/api/", limiter);

// Health check endpoint
app.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API routes
app.use("/api/projects", projectRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/settings", settingsRoutes);

// Error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    });
  }
);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await Database.initialize();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Handle server errors
    server.on("error", (error: Error) => {
      logger.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  Database.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  Database.close();
  process.exit(0);
});

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
