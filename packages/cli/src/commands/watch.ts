import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";
import chokidar from "chokidar";
import { CodeAnalyzer, TestGenerator } from "@smart-test-gen/core";

export async function watchCommand(options: any): Promise<void> {
  const spinner = ora("Starting file watcher...").start();

  try {
    const projectRoot = process.cwd();
    const configPath = path.join(projectRoot, "test-gen.config.js");

    // Load configuration
    let config;
    if (await fs.pathExists(configPath)) {
      config = require(configPath);
    } else {
      spinner.fail('No configuration found. Run "test-gen init" first.');
      return;
    }

    // Initialize components
    const analyzer = new CodeAnalyzer(projectRoot, {
      include: options.include || config.include,
      exclude: options.exclude || config.exclude,
    });

    const generator = new TestGenerator(config.testConfig);

    // Setup file watcher
    const watchPatterns = options.include ||
      config.include || ["src/**/*.{js,ts,jsx,tsx}"];
    const watcher = chokidar.watch(watchPatterns, {
      ignored: options.exclude ||
        config.exclude || ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
      ignoreInitial: true,
      cwd: projectRoot,
    });

    spinner.succeed("File watcher started. Monitoring for changes...");
    console.log(chalk.green("👀 Watching for file changes..."));
    console.log(chalk.gray("Press Ctrl+C to stop"));

    let debounceTimer: NodeJS.Timeout | null = null;
    const debounceDelay = parseInt(options.debounce) || 1000;

    const processChanges = async (filePath: string, eventType: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(async () => {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(chalk.yellow(`\\n📝 ${eventType}: ${relativePath}`));

        const fileSpinner = ora("Analyzing changes...").start();

        try {
          // Analyze the changed file
          const analysisResult = await analyzer.analyzeFile(filePath);

          if (analysisResult.functions.length === 0) {
            fileSpinner.info("No testable functions found in this file.");
            return;
          }

          fileSpinner.text = "Generating updated tests...";

          // Generate tests for the changed file
          const generatedTests =
            await generator.generateTestsForFile(analysisResult);

          if (generatedTests.length === 0) {
            fileSpinner.warn("No tests generated for this file.");
            return;
          }

          // Write test files
          await generator.writeTestFiles(generatedTests);

          fileSpinner.succeed(
            `Generated ${generatedTests.length} test files for ${relativePath}`
          );

          // Show brief summary
          generatedTests.forEach((test) => {
            console.log(
              chalk.green(
                `  ✅ ${path.relative(projectRoot, test.filePath)} (${test.coverage}% coverage)`
              )
            );
          });
        } catch (error) {
          fileSpinner.fail(`Failed to process ${relativePath}: ${error}`);
        }
      }, debounceDelay);
    };

    // Watch for file changes
    watcher
      .on("add", (filePath) =>
        processChanges(path.resolve(projectRoot, filePath), "Added")
      )
      .on("change", (filePath) =>
        processChanges(path.resolve(projectRoot, filePath), "Modified")
      )
      .on("unlink", (filePath) => {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(chalk.red(`\\n🗑️  Deleted: ${relativePath}`));
        // TODO: Remove corresponding test files
      })
      .on("error", (error) => {
        console.error(chalk.red("\\n❌ Watcher error:"), error);
      });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log(chalk.yellow("\\n\\n👋 Stopping file watcher..."));
      watcher.close();
      process.exit(0);
    });

    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    spinner.fail(`Failed to start file watcher: ${error}`);
    process.exit(1);
  }
}
