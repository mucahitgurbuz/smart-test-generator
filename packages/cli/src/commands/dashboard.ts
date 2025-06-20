import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import open from "open";

export async function dashboardCommand(options: any): Promise<void> {
  const port = options.port || 3000;
  const shouldOpen = options.open !== false;

  try {
    const projectRoot = process.cwd();
    const dashboardPath = path.join(
      __dirname,
      "../../dashboard/dist/index.html"
    );

    // Check if dashboard is built
    if (!(await fs.pathExists(dashboardPath))) {
      console.log(chalk.yellow("📦 Dashboard not found. Building..."));

      // Try to build dashboard
      const { exec } = require("child_process");
      const util = require("util");
      const execAsync = util.promisify(exec);

      try {
        await execAsync("npm run build:dashboard", {
          cwd: path.join(__dirname, "../../../.."),
        });
      } catch (buildError) {
        console.error(chalk.red("❌ Failed to build dashboard:"), buildError);
        console.log(
          chalk.yellow(
            "\\n💡 Alternative: Use the web version at https://smart-test-gen.com/dashboard"
          )
        );
        return;
      }
    }

    console.log(chalk.green("🚀 Starting Smart Test Generator Dashboard..."));

    // Start a simple HTTP server
    const http = require("http");
    const fs_node = require("fs");
    const path_node = require("path");

    const server = http.createServer((req: any, res: any) => {
      let filePath = path_node.join(
        dashboardPath,
        req.url === "/" ? "index.html" : req.url
      );

      const extname = path_node.extname(filePath);
      let contentType = "text/html";

      switch (extname) {
        case ".js":
          contentType = "text/javascript";
          break;
        case ".css":
          contentType = "text/css";
          break;
        case ".json":
          contentType = "application/json";
          break;
        case ".png":
          contentType = "image/png";
          break;
        case ".jpg":
          contentType = "image/jpg";
          break;
      }

      fs_node.readFile(filePath, (error: any, content: any) => {
        if (error) {
          if (error.code === "ENOENT") {
            // Serve a simple dashboard
            const simpleDashboard = createSimpleDashboard(projectRoot);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(simpleDashboard);
          } else {
            res.writeHead(500);
            res.end(`Server Error: ${error.code}`);
          }
        } else {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(content, "utf-8");
        }
      });
    });

    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(chalk.green(`\\n✨ Dashboard running at: ${url}`));
      console.log(chalk.gray("Press Ctrl+C to stop"));

      if (shouldOpen) {
        open(url);
      }
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log(chalk.yellow("\\n\\n👋 Stopping dashboard..."));
      server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error(chalk.red("❌ Failed to start dashboard:"), error);
    process.exit(1);
  }
}

function createSimpleDashboard(projectRoot: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Test Generator Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 3rem;
        }
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .card h3 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        .card p {
            color: #666;
            line-height: 1.6;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        .feature {
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 1.5rem;
            color: white;
            text-align: center;
        }
        .feature h4 {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        .cta {
            text-align: center;
            margin-top: 3rem;
        }
        .cta button {
            background: #28a745;
            color: white;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            border-radius: 8px;
            cursor: pointer;
            margin: 0 1rem;
            transition: background 0.3s ease;
        }
        .cta button:hover {
            background: #218838;
        }
        .status {
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 1rem;
            color: white;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Smart Test Generator</h1>
            <p>AI that writes better tests than you do (and 10x faster)</p>
        </div>

        <div class="status">
            <h3>📊 Project Status</h3>
            <p><strong>Project:</strong> ${path.basename(projectRoot)}</p>
            <p><strong>Path:</strong> ${projectRoot}</p>
            <p><strong>Status:</strong> Ready for test generation</p>
        </div>

        <div class="cards">
            <div class="card">
                <h3>🔍 Code Analysis</h3>
                <p>Our AI engine analyzes your JavaScript/TypeScript codebase to identify testable functions, understand framework patterns, and detect dependencies that need mocking.</p>
            </div>

            <div class="card">
                <h3>🧪 Smart Test Generation</h3>
                <p>Generate comprehensive test suites including unit tests, integration tests, and component tests with realistic mock data and edge case coverage.</p>
            </div>

            <div class="card">
                <h3>📈 Real-time Monitoring</h3>
                <p>Watch your files for changes and automatically generate or update tests. Keep your test suite in sync with your evolving codebase.</p>
            </div>
        </div>

        <div class="feature-grid">
            <div class="feature">
                <h4>⚡ Framework Support</h4>
                <p>React, Vue, Express, Next.js</p>
            </div>

            <div class="feature">
                <h4>🎯 Test Frameworks</h4>
                <p>Jest, Vitest, Cypress</p>
            </div>

            <div class="feature">
                <h4>🤖 AI Providers</h4>
                <p>OpenAI, Anthropic, Local</p>
            </div>

            <div class="feature">
                <h4>📊 Coverage Goals</h4>
                <p>90%+ achievable coverage</p>
            </div>
        </div>

        <div class="cta">
            <button onclick="runAnalysis()">🔍 Analyze Codebase</button>
            <button onclick="generateTests()">🧪 Generate Tests</button>
            <button onclick="openTerminal()">💻 Open Terminal</button>
        </div>
    </div>

    <script>
        function runAnalysis() {
            alert('Run "test-gen analyze" in your terminal to analyze the codebase');
        }

        function generateTests() {
            alert('Run "test-gen generate" in your terminal to generate comprehensive tests');
        }

        function openTerminal() {
            alert('Use your terminal to run Smart Test Generator commands:\\n\\n' +
                  'test-gen init      # Initialize configuration\\n' +
                  'test-gen analyze   # Analyze codebase\\n' +
                  'test-gen generate  # Generate tests\\n' +
                  'test-gen watch     # Watch for changes');
        }
    </script>
</body>
</html>`;
}
