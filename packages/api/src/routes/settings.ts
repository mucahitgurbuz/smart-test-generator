import { Router, Request, Response } from "express";
import { logger } from "../utils/logger";

const router = Router();

// Simple in-memory settings storage (in production, this should use a database)
let userSettings: any = {
  general: {
    autoGenerate: true,
    saveOnGenerate: true,
    notifications: true,
  },
  ai: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
  },
  testing: {
    framework: "jest",
    coverage: true,
    timeout: 5000,
  },
  appearance: {
    theme: "dark",
    animations: true,
  },
};

// GET /api/settings - Get user settings
router.get("/", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: userSettings,
    });
  } catch (error) {
    logger.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
    });
  }
});

// POST /api/settings - Save user settings
router.post("/", async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;

    // Merge with existing settings
    userSettings = { ...userSettings, ...newSettings };

    logger.info("Settings updated:", userSettings);

    res.json({
      success: true,
      data: userSettings,
      message: "Settings saved successfully",
    });
  } catch (error) {
    logger.error("Error saving settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save settings",
    });
  }
});

export default router;
