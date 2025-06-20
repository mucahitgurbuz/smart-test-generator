import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";
import { CodeAnalyzer, TestGenerator } from "@smart-test-gen/core";

export async function generateCommand(options: any): Promise<void> {
  const spinner = ora("Generating comprehensive tests...").start();

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

    // Override config with command options
    if (options.coverage) {
      config.testConfig.coverage = parseInt(options.coverage);
    }
    if (options.types) {
      config.testConfig.testTypes = options.types;
    }
    if (options.framework) {
      config.testConfig.framework = options.framework;
    }

    spinner.text = "Analyzing codebase...";

    // Initialize analyzer
    const analyzer = new CodeAnalyzer(projectRoot, {
      include: config.include,
      exclude: config.exclude,
    });

    // Analyze the codebase
    const analysisResults = await analyzer.analyzeProject();

    if (analysisResults.length === 0) {
      spinner.fail(
        "No files found to analyze. Check your include/exclude patterns."
      );
      return;
    }

    spinner.text = "Generating tests with AI...";

    // Initialize test generator
    const generator = new TestGenerator(config.testConfig);

    // Generate tests
    const generatedTests = await generator.generateTests(analysisResults);

    if (generatedTests.length === 0) {
      spinner.warn(
        "No tests were generated. Try adjusting your configuration."
      );
      return;
    }

    spinner.text = "Writing test files...";

    // Show what would be generated (dry run)
    if (options.dryRun) {
      spinner.succeed("Dry run completed. Here's what would be generated:");

      console.log(chalk.green("\\n📝 Generated Tests:\\n"));

      generatedTests.forEach((test) => {
        console.log(
          chalk.white(`📄 ${path.relative(projectRoot, test.filePath)}`)
        );
        console.log(
          chalk.gray(
            `   Type: ${test.testType}, Framework: ${test.framework}, Coverage: ${test.coverage}%`
          )
        );
        console.log(chalk.gray(`   Functions: ${test.functions.join(", ")}`));
      });

      const stats = generator.getGenerationStats(generatedTests);
      console.log(chalk.green("\\n📊 Statistics:"));
      console.log(chalk.white(`   Total tests: ${stats.totalTests}`));
      console.log(
        chalk.white(`   Average coverage: ${Math.round(stats.avgCoverage)}%`)
      );
      console.log(chalk.white(`   Functions covered: ${stats.totalFunctions}`));

      return;
    }

    // Write test files
    await generator.writeTestFiles(generatedTests);

    spinner.succeed(`Generated ${generatedTests.length} test files!`);

    // Show results
    const stats = generator.getGenerationStats(generatedTests);

    console.log(chalk.green("\\n🎉 Test Generation Complete!\\n"));
    console.log(chalk.white("📊 Statistics:"));
    console.log(chalk.white(`   • ${stats.totalTests} test files generated`));
    console.log(chalk.white(`   • ${stats.totalFunctions} functions covered`));
    console.log(
      chalk.white(`   • ${Math.round(stats.avgCoverage)}% average coverage`)
    );

    console.log(chalk.white("\\n📝 Test Types:"));
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(chalk.white(`   • ${type}: ${count} files`));
    });

    console.log(chalk.green("\\n✨ Next Steps:"));
    console.log(
      chalk.cyan("   npm test") + chalk.gray(" - Run your new tests")
    );
    console.log(
      chalk.cyan("   test-gen dashboard") +
        chalk.gray(" - View test coverage dashboard")
    );
    console.log(
      chalk.cyan("   test-gen watch") +
        chalk.gray(" - Auto-generate tests on file changes")
    );
  } catch (error) {
    spinner.fail(`Test generation failed: ${error}`);
    console.error(chalk.red("\\n🔥 Error details:"), error);
    process.exit(1);
  }
}
