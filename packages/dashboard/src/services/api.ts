const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

export interface Project {
  id: string;
  name: string;
  path: string;
  framework: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  filePath: string;
  status: "pending" | "generating" | "completed" | "failed";
  testsGenerated: number;
  coverage: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  id: string;
  projectId: string;
  filePath: string;
  complexity: number;
  linesOfCode: number;
  functions: string[];
  recommendations: string[];
  createdAt: string;
}

export interface TestStats {
  totalTests: number;
  averageCoverage: number;
  activeProjects: number;
  recentActivity: TestSuite[];
}

export interface AnalysisSummary {
  totalFiles: number;
  averageComplexity: number;
  totalLinesOfCode: number;
  commonRecommendations: string[];
  complexityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface TestResult {
  id: string;
  name: string;
  status: "passed" | "failed" | "pending";
  duration: number;
  file: string;
  error?: string;
  timestamp: Date;
}

class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "API request failed");
    }

    return data.data;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.fetchApi<Project[]>("/projects");
  }

  async getProject(id: string): Promise<Project> {
    return this.fetchApi<Project>(`/projects/${id}`);
  }

  async getProjectTests(projectId: string): Promise<TestSuite[]> {
    return this.fetchApi<TestSuite[]>(`/projects/${projectId}/tests`);
  }

  async getProjectAnalysis(projectId: string): Promise<AnalysisResult[]> {
    return this.fetchApi<AnalysisResult[]>(`/projects/${projectId}/analysis`);
  }

  // Tests
  async getTestSuites(): Promise<TestSuite[]> {
    return this.fetchApi<TestSuite[]>("/tests");
  }

  async generateTests(data: {
    projectId: string;
    filePath: string;
    framework?: string;
    testType?: string;
  }): Promise<TestSuite> {
    return this.fetchApi<TestSuite>("/tests/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTestStats(): Promise<TestStats> {
    return this.fetchApi<TestStats>("/tests/stats");
  }

  async getTestResults(): Promise<TestResult[]> {
    return this.fetchApi<TestResult[]>("/tests/results");
  }

  // Analysis
  async getAnalysisResults(projectId?: string): Promise<AnalysisResult[]> {
    const endpoint = projectId
      ? `/analysis?projectId=${projectId}`
      : "/analysis";
    return this.fetchApi<AnalysisResult[]>(endpoint);
  }

  async analyzeCode(data: {
    projectId: string;
    filePath: string;
    code?: string;
  }): Promise<AnalysisResult> {
    return this.fetchApi<AnalysisResult>("/analysis/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAnalysisSummary(): Promise<AnalysisSummary> {
    return this.fetchApi<AnalysisSummary>("/analysis/summary");
  }

  // Settings
  async getSettings(): Promise<any> {
    try {
      return this.fetchApi<any>("/settings");
    } catch (error) {
      // Return default settings if API call fails
      return {};
    }
  }

  async saveSettings(settings: any): Promise<void> {
    return this.fetchApi<void>("/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService();
