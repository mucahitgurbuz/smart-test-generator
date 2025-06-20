import * as fs from "fs-extra";
import * as path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { ProjectConfig } from "@mucahitgurbuz/smart-test-gen-core";

export async function initCommand(options: any): Promise<void> {
  const spinner = ora("Initializing Smart Test Generator...").start();

  try {
    const projectRoot = process.cwd();
    const packageJsonPath = path.join(projectRoot, "package.json");

    // Check if package.json exists
    if (!(await fs.pathExists(packageJsonPath))) {
      spinner.fail(
        "No package.json found. Please run this command in a project root."
      );
      return;
    }

    const packageJson = await fs.readJson(packageJsonPath);

    spinner.stop();

    // Interactive configuration
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "framework",
        message: "Which testing framework would you like to use?",
        choices: [
          { name: "Jest (Recommended)", value: "jest" },
          { name: "Vitest (Fast)", value: "vitest" },
          { name: "Cypress (E2E)", value: "cypress" },
        ],
        default: options.framework || "jest",
      },
      {
        type: "list",
        name: "aiProvider",
        message: "Choose your AI provider:",
        choices: [
          { name: "OpenAI GPT-4 (Best quality)", value: "openai" },
          { name: "Anthropic Claude (Good alternative)", value: "anthropic" },
          { name: "Local/Offline (Basic templates)", value: "local" },
        ],
        default: options.aiProvider || "local",
      },
      {
        type: "input",
        name: "apiKey",
        message: "Enter your AI provider API key (optional, can be set later):",
        when: (answers) => answers.aiProvider !== "local",
        validate: (input) =>
          input.length === 0 || input.length > 10 || "API key seems too short",
      },
      {
        type: "checkbox",
        name: "testTypes",
        message: "What types of tests should be generated?",
        choices: [
          { name: "Unit Tests", value: "unit", checked: true },
          { name: "Integration Tests", value: "integration", checked: true },
          { name: "Component Tests", value: "component" },
          { name: "E2E Tests", value: "e2e" },
        ],
      },
      {
        type: "input",
        name: "coverage",
        message: "Target test coverage percentage:",
        default: "90",
        validate: (input) => {
          const num = parseInt(input);
          return (
            (num >= 0 && num <= 100) || "Coverage must be between 0 and 100"
          );
        },
      },
    ]);

    const spinner2 = ora("Creating configuration...").start();

    // Create configuration
    const config: ProjectConfig = {
      rootDir: projectRoot,
      include: ["src/**/*.{js,ts,jsx,tsx}"],
      exclude: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}", "node_modules/**"],
      framework: {
        type: detectProjectFramework(packageJson),
        features: [],
      },
      testConfig: {
        framework: answers.framework,
        coverage: parseInt(answers.coverage),
        includeEdgeCases: true,
        mockStrategy: "auto",
        testTypes: answers.testTypes,
        aiProvider: {
          name: answers.aiProvider,
          model:
            answers.aiProvider === "openai"
              ? "gpt-4"
              : "claude-3-sonnet-20240229",
          apiKey: answers.apiKey,
          temperature: 0.2,
          maxTokens: 2000,
        },
      },
      aiConfig: {
        name: answers.aiProvider,
        model:
          answers.aiProvider === "openai"
            ? "gpt-4"
            : "claude-3-sonnet-20240229",
        apiKey: answers.apiKey,
        temperature: 0.2,
        maxTokens: 2000,
      },
    };

    // Save configuration
    const configPath = path.join(projectRoot, "test-gen.config.js");
    const configContent = generateConfigFile(config);
    await fs.writeFile(configPath, configContent);

    // Create .env file for API keys if needed
    if (answers.apiKey) {
      const envPath = path.join(projectRoot, ".env");
      const envKey =
        answers.aiProvider === "openai"
          ? "OPENAI_API_KEY"
          : "ANTHROPIC_API_KEY";
      const envContent = `${envKey}=${answers.apiKey}\\n`;

      if (await fs.pathExists(envPath)) {
        await fs.appendFile(envPath, envContent);
      } else {
        await fs.writeFile(envPath, envContent);
      }
    }

    // Update package.json with test scripts
    await updatePackageJson(
      packageJsonPath,
      answers.framework,
      answers.testTypes
    );

    // Install dependencies
    await installDependencies(
      projectRoot,
      answers.framework,
      answers.testTypes
    );

    spinner2.succeed("Configuration created successfully!");

    // Show next steps
    console.log(
      chalk.green("\\n🎉 Smart Test Generator initialized successfully!\\n")
    );
    console.log(chalk.white("Next steps:"));
    console.log(
      chalk.cyan("  1. test-gen analyze") +
        chalk.gray(" - Analyze your codebase")
    );
    console.log(
      chalk.cyan("  2. test-gen generate") +
        chalk.gray(" - Generate comprehensive tests")
    );
    console.log(
      chalk.cyan("  3. test-gen dashboard") +
        chalk.gray(" - Open visual dashboard")
    );
    console.log(chalk.gray("\\nConfiguration saved to: test-gen.config.js"));
  } catch (error) {
    spinner.fail(`Initialization failed: ${error}`);
    process.exit(1);
  }
}

function detectProjectFramework(
  packageJson: any
): "react" | "vue" | "express" | "next" | "generic" {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  if (dependencies.next) return "next";
  if (dependencies.react) return "react";
  if (dependencies.vue) return "vue";
  if (dependencies.express) return "express";

  return "generic";
}

function generateConfigFile(config: ProjectConfig): string {
  return `module.exports = {
  // Project configuration
  rootDir: '${config.rootDir}',
  include: ${JSON.stringify(config.include, null, 4)},
  exclude: ${JSON.stringify(config.exclude, null, 4)},

  // Framework detection
  framework: {
    type: '${config.framework.type}',
    features: ${JSON.stringify(config.framework.features)}
  },

  // Test generation settings
  testConfig: {
    framework: '${config.testConfig.framework}',
    coverage: ${config.testConfig.coverage},
    includeEdgeCases: ${config.testConfig.includeEdgeCases},
    mockStrategy: '${config.testConfig.mockStrategy}',
    testTypes: ${JSON.stringify(config.testConfig.testTypes)}
  },

  // AI provider configuration
  aiConfig: {
    name: '${config.aiConfig.name}',
    model: '${config.aiConfig.model}',
    temperature: ${config.aiConfig.temperature},
    maxTokens: ${config.aiConfig.maxTokens}
    // API key should be set via environment variable
  }
};`;
}

async function updatePackageJson(
  packageJsonPath: string,
  framework: string,
  testTypes: string[]
): Promise<void> {
  const packageJson = await fs.readJson(packageJsonPath);

  // Add test scripts
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts["test:generate"] = "test-gen generate";
  packageJson.scripts["test:watch"] = "test-gen watch";
  packageJson.scripts["test:dashboard"] = "test-gen dashboard";

  if (framework === "jest") {
    packageJson.scripts["test"] = "jest";
    packageJson.scripts["test:coverage"] = "jest --coverage";
  } else if (framework === "vitest") {
    packageJson.scripts["test"] = "vitest";
    packageJson.scripts["test:coverage"] = "vitest --coverage";
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function installDependencies(
  projectRoot: string,
  framework: string,
  testTypes: string[]
): Promise<void> {
  const spinner = ora("Installing dependencies...").start();

  try {
    const { exec } = require("child_process");
    const util = require("util");
    const execAsync = util.promisify(exec);

    let deps: string[] = [];
    let devDeps: string[] = [];

    // Core dependencies
    devDeps.push("smart-test-gen");

    // Framework-specific dependencies
    if (framework === "jest") {
      devDeps.push("jest", "@types/jest");
      if (testTypes.includes("component")) {
        devDeps.push("@testing-library/react", "@testing-library/jest-dom");
      }
    } else if (framework === "vitest") {
      devDeps.push("vitest", "@vitest/ui");
    } else if (framework === "cypress") {
      devDeps.push("cypress");
    }

    // Install dependencies
    if (devDeps.length > 0) {
      await execAsync(`npm install --save-dev ${devDeps.join(" ")}`, {
        cwd: projectRoot,
      });
    }

    spinner.succeed("Dependencies installed successfully!");
  } catch (error) {
    spinner.fail(`Failed to install dependencies: ${error}`);
  }
}
