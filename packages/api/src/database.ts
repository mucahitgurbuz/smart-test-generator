import sqlite3 from "sqlite3";
import { logger } from "./utils/logger";

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

class DatabaseManager {
  private db: sqlite3.Database | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database("smart-test-generator.db", (err) => {
        if (err) {
          logger.error("Error opening database:", err);
          reject(err);
          return;
        }

        logger.info("Connected to SQLite database");
        this.createTables().then(resolve).catch(reject);
      });
    });
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const queries = [
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        framework TEXT NOT NULL,
        language TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS test_suites (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        status TEXT NOT NULL,
        tests_generated INTEGER DEFAULT 0,
        coverage REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`,
      `CREATE TABLE IF NOT EXISTS analysis_results (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        complexity INTEGER NOT NULL,
        lines_of_code INTEGER NOT NULL,
        functions TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`,
    ];

    for (const query of queries) {
      await this.run(query);
    }

    // Insert sample data if tables are empty
    await this.insertSampleData();
  }

  private async insertSampleData(): Promise<void> {
    const projectCount = await this.get(
      "SELECT COUNT(*) as count FROM projects"
    );

    if (projectCount.count === 0) {
      const sampleProjects: Project[] = [
        {
          id: "1",
          name: "E-commerce API",
          path: "/projects/ecommerce-api",
          framework: "Express",
          language: "TypeScript",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "React Dashboard",
          path: "/projects/react-dashboard",
          framework: "React",
          language: "TypeScript",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const sampleTestSuites: TestSuite[] = [
        {
          id: "1",
          projectId: "1",
          name: "User API Tests",
          filePath: "/tests/user.test.ts",
          status: "completed",
          testsGenerated: 15,
          coverage: 87.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          projectId: "1",
          name: "Product API Tests",
          filePath: "/tests/product.test.ts",
          status: "generating",
          testsGenerated: 8,
          coverage: 62.3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          projectId: "2",
          name: "Component Tests",
          filePath: "/tests/components.test.tsx",
          status: "completed",
          testsGenerated: 23,
          coverage: 91.2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const sampleAnalysis: AnalysisResult[] = [
        {
          id: "1",
          projectId: "1",
          filePath: "/src/controllers/userController.ts",
          complexity: 7,
          linesOfCode: 156,
          functions: ["createUser", "getUserById", "updateUser", "deleteUser"],
          recommendations: [
            "Add input validation",
            "Improve error handling",
            "Add rate limiting",
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          projectId: "2",
          filePath: "/src/components/Dashboard.tsx",
          complexity: 4,
          linesOfCode: 89,
          functions: ["handleDataUpdate", "renderChart", "filterData"],
          recommendations: [
            "Split component into smaller pieces",
            "Add prop type validation",
          ],
          createdAt: new Date().toISOString(),
        },
      ];

      // Insert sample data
      for (const project of sampleProjects) {
        await this.run(
          "INSERT INTO projects (id, name, path, framework, language, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            project.id,
            project.name,
            project.path,
            project.framework,
            project.language,
            project.createdAt,
            project.updatedAt,
          ]
        );
      }

      for (const testSuite of sampleTestSuites) {
        await this.run(
          "INSERT INTO test_suites (id, project_id, name, file_path, status, tests_generated, coverage, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            testSuite.id,
            testSuite.projectId,
            testSuite.name,
            testSuite.filePath,
            testSuite.status,
            testSuite.testsGenerated,
            testSuite.coverage,
            testSuite.createdAt,
            testSuite.updatedAt,
          ]
        );
      }

      for (const analysis of sampleAnalysis) {
        await this.run(
          "INSERT INTO analysis_results (id, project_id, file_path, complexity, lines_of_code, functions, recommendations, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            analysis.id,
            analysis.projectId,
            analysis.filePath,
            analysis.complexity,
            analysis.linesOfCode,
            JSON.stringify(analysis.functions),
            JSON.stringify(analysis.recommendations),
            analysis.createdAt,
          ]
        );
      }

      logger.info("Sample data inserted successfully");
    }
  }

  private async run(query: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      this.db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async get(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  private async all(query: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Public methods for accessing data
  async getProjects(): Promise<Project[]> {
    const rows = await this.all(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      path: row.path,
      framework: row.framework,
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getProject(id: string): Promise<Project | null> {
    const row = await this.get("SELECT * FROM projects WHERE id = ?", [id]);
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      path: row.path,
      framework: row.framework,
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getTestSuites(projectId?: string): Promise<TestSuite[]> {
    let query = "SELECT * FROM test_suites";
    let params: any[] = [];

    if (projectId) {
      query += " WHERE project_id = ?";
      params = [projectId];
    }

    query += " ORDER BY created_at DESC";

    const rows = await this.all(query, params);
    return rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      filePath: row.file_path,
      status: row.status,
      testsGenerated: row.tests_generated,
      coverage: row.coverage,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getAnalysisResults(projectId?: string): Promise<AnalysisResult[]> {
    let query = "SELECT * FROM analysis_results";
    let params: any[] = [];

    if (projectId) {
      query += " WHERE project_id = ?";
      params = [projectId];
    }

    query += " ORDER BY created_at DESC";

    const rows = await this.all(query, params);
    return rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      filePath: row.file_path,
      complexity: row.complexity,
      linesOfCode: row.lines_of_code,
      functions: JSON.parse(row.functions),
      recommendations: JSON.parse(row.recommendations),
      createdAt: row.created_at,
    }));
  }

  close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error("Error closing database:", err);
        } else {
          logger.info("Database connection closed");
        }
      });
    }
  }
}

export const Database = new DatabaseManager();
