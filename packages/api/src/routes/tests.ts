import { Router, Request, Response } from "express";
import { Database } from "../database";
import { logger } from "../utils/logger";

const router = Router();

// GET /api/tests - Get all test suites
router.get("/", async (req: Request, res: Response) => {
  try {
    const testSuites = await Database.getTestSuites();
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

// POST /api/tests/generate - Generate tests for a file or project
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { projectId, filePath, framework, testType } = req.body;

    if (!projectId || !filePath) {
      return res.status(400).json({
        success: false,
        error: "projectId and filePath are required",
      });
    }

    // Simulate test generation (in real implementation, this would call the core engine)
    const testSuite = {
      id: Date.now().toString(),
      projectId,
      name: `Tests for ${filePath.split("/").pop()}`,
      filePath: filePath.replace(/\.(ts|js|tsx|jsx)$/, ".test.$1"),
      status: "generating",
      testsGenerated: 0,
      coverage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate async generation
    setTimeout(async () => {
      // Update status to completed with mock results
      logger.info(`Test generation completed for ${filePath}`);
    }, 2000);

    res.json({
      success: true,
      data: testSuite,
      message: "Test generation started",
    });
  } catch (error) {
    logger.error("Error generating tests:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate tests",
    });
  }
});

// GET /api/tests/stats - Get test statistics
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const testSuites = await Database.getTestSuites();

    const stats = {
      totalTests: testSuites.reduce(
        (sum, suite) => sum + suite.testsGenerated,
        0
      ),
      averageCoverage:
        testSuites.reduce((sum, suite) => sum + suite.coverage, 0) /
          testSuites.length || 0,
      activeProjects: new Set(testSuites.map((suite) => suite.projectId)).size,
      recentActivity: testSuites
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error fetching test stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch test statistics",
    });
  }
});

// GET /api/tests/results - Get individual test results
router.get("/results", async (req: Request, res: Response) => {
  try {
    // Generate mock test results for demonstration
    const mockTestResults = [
      {
        id: "1",
        name: "should calculate user age correctly",
        status: "passed",
        duration: 45,
        file: "user.test.js",
        timestamp: new Date("2024-01-15T10:30:00"),
      },
      {
        id: "2",
        name: "should handle invalid email format",
        status: "failed",
        duration: 120,
        file: "validation.test.js",
        error: "Expected validation to fail but it passed",
        timestamp: new Date("2024-01-15T10:29:30"),
      },
      {
        id: "3",
        name: "should authenticate user with valid credentials",
        status: "passed",
        duration: 230,
        file: "auth.test.js",
        timestamp: new Date("2024-01-15T10:29:00"),
      },
      {
        id: "4",
        name: "should render component with props",
        status: "pending",
        duration: 0,
        file: "component.test.jsx",
        timestamp: new Date("2024-01-15T10:28:30"),
      },
      {
        id: "5",
        name: "should handle API timeout gracefully",
        status: "failed",
        duration: 5000,
        file: "api.test.js",
        error: "Timeout exceeded: Expected response within 3000ms",
        timestamp: new Date("2024-01-15T10:28:00"),
      },
    ];

    res.json({
      success: true,
      data: mockTestResults,
    });
  } catch (error) {
    logger.error("Error fetching test results:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch test results",
    });
  }
});

export default router;
