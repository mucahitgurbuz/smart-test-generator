import { Router, Request, Response } from "express";
import { Database } from "../database";
import { logger } from "../utils/logger";

const router = Router();

// GET /api/projects - Get all projects
router.get("/", async (req: Request, res: Response) => {
  try {
    const projects = await Database.getProjects();
    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    logger.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
    });
  }
});

// GET /api/projects/:id - Get project by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await Database.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    logger.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch project",
    });
  }
});

// GET /api/projects/:id/tests - Get test suites for a project
router.get("/:id/tests", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testSuites = await Database.getTestSuites(id);

    res.json({
      success: true,
      data: testSuites,
    });
  } catch (error) {
    logger.error("Error fetching test suites:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch test suites",
    });
  }
});

// GET /api/projects/:id/analysis - Get analysis results for a project
router.get("/:id/analysis", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const analysisResults = await Database.getAnalysisResults(id);

    res.json({
      success: true,
      data: analysisResults,
    });
  } catch (error) {
    logger.error("Error fetching analysis results:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analysis results",
    });
  }
});

export default router;
