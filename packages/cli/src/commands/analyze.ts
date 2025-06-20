import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";
import { CodeAnalyzer } from "@smart-test-gen/core";

export async function analyzeCommand(
  paths: string[] = ["src/"],
  options: any
): Promise<void> {
  const spinner = ora("Analyzing codebase...").start();

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

    // Initialize analyzer
    const analyzer = new CodeAnalyzer(projectRoot, {
      include: config.include || ["**/*.{js,ts,jsx,tsx}"],
      exclude: config.exclude || ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
    });

    // Analyze the specified paths
    const results = await analyzer.analyzeProject();

    spinner.succeed(`Analyzed ${results.length} files`);

    // Display results
    console.log(chalk.green("\\n📊 Analysis Results:\\n"));

    let totalFunctions = 0;
    let testableFunctions = 0;

    results.forEach((result) => {
      const functions = result.functions.length;
      const testable = result.functions.filter((f) => f.complexity > 1).length;

      totalFunctions += functions;
      testableFunctions += testable;

      if (options.verbose || functions > 0) {
        console.log(
          chalk.white(`📁 ${path.relative(projectRoot, result.filePath)}`)
        );
        console.log(
          chalk.gray(
            `   Functions: ${functions}, Testable: ${testable}, Framework: ${result.framework.type}`
          )
        );

        if (options.verbose) {
          result.functions.forEach((func) => {
            const complexity =
              func.complexity > 5
                ? chalk.red(`${func.complexity}`)
                : chalk.yellow(`${func.complexity}`);
            console.log(
              chalk.gray(`   - ${func.name}() [complexity: ${complexity}]`)
            );
          });
        }
      }
    });

    console.log(chalk.green(`\\n✨ Summary:`));
    console.log(chalk.white(`   Total files: ${results.length}`));
    console.log(chalk.white(`   Total functions: ${totalFunctions}`));
    console.log(chalk.white(`   Testable functions: ${testableFunctions}`));
    console.log(
      chalk.white(
        `   Test coverage potential: ${Math.round((testableFunctions / totalFunctions) * 100)}%`
      )
    );

    // Save results if requested
    if (options.output) {
      const outputPath = path.resolve(options.output);
      await fs.writeJson(outputPath, results, { spaces: 2 });
      console.log(chalk.gray(`\\n💾 Results saved to: ${outputPath}`));
    }

    // Show next steps
    console.log(
      chalk.cyan(
        '\\n🚀 Next: Run "test-gen generate" to create comprehensive tests!'
      )
    );
  } catch (error) {
    spinner.fail(`Analysis failed: ${error}`);
    process.exit(1);
  }
}
