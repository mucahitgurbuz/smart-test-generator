import { Router, Request, Response } from "express";
import { Database } from "../database";
import { logger } from "../utils/logger";

const router = Router();

// GET /api/analysis - Get all analysis results
router.get("/", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const analysisResults = await Database.getAnalysisResults(
      projectId as string
    );

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

// POST /api/analysis/analyze - Analyze a file or project
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { projectId, filePath, code } = req.body;

    if (!projectId || !filePath) {
      return res.status(400).json({
        success: false,
        error: "projectId and filePath are required",
      });
    }

    // Simulate code analysis (in real implementation, this would use the core analyzer)
    const analysisResult = {
      id: Date.now().toString(),
      projectId,
      filePath,
      complexity: Math.floor(Math.random() * 10) + 1,
      linesOfCode: code
        ? code.split("\n").length
        : Math.floor(Math.random() * 200) + 50,
      functions: [
        "handleSubmit",
        "validateInput",
        "processData",
        "renderComponent",
      ].slice(0, Math.floor(Math.random() * 4) + 1),
      recommendations: [
        "Consider breaking down complex functions",
        "Add error handling",
        "Improve type safety",
        "Add unit tests",
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: analysisResult,
      message: "Code analysis completed",
    });
  } catch (error) {
    logger.error("Error analyzing code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze code",
    });
  }
});

// GET /api/analysis/summary - Get analysis summary
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const analysisResults = await Database.getAnalysisResults();

    const summary = {
      totalFiles: analysisResults.length,
      averageComplexity:
        analysisResults.reduce((sum, result) => sum + result.complexity, 0) /
          analysisResults.length || 0,
      totalLinesOfCode: analysisResults.reduce(
        (sum, result) => sum + result.linesOfCode,
        0
      ),
      commonRecommendations: getTopRecommendations(analysisResults),
      complexityDistribution: getComplexityDistribution(analysisResults),
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error("Error fetching analysis summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analysis summary",
    });
  }
});

function getTopRecommendations(results: any[]): string[] {
  const recommendations: { [key: string]: number } = {};

  results.forEach((result) => {
    result.recommendations.forEach((rec: string) => {
      recommendations[rec] = (recommendations[rec] || 0) + 1;
    });
  });

  return Object.entries(recommendations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([rec]) => rec);
}

function getComplexityDistribution(results: any[]): { [key: string]: number } {
  const distribution = { low: 0, medium: 0, high: 0 };

  results.forEach((result) => {
    if (result.complexity <= 3) distribution.low++;
    else if (result.complexity <= 7) distribution.medium++;
    else distribution.high++;
  });

  return distribution;
}

export default router;
