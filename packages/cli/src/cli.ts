#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import boxen from "boxen";
import { initCommand } from "./commands/init.js";
import { analyzeCommand } from "./commands/analyze.js";
import { generateCommand } from "./commands/generate.js";
import { watchCommand } from "./commands/watch.js";
import { dashboardCommand } from "./commands/dashboard.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

// ASCII Art Banner
const banner = `
  ____                       _     _____         _      ____
 / ___| _ __ ___   __ _ _ __| |_  |_   _|__  ___| |_   / ___| ___ _ __
 \\___ \\| '_ \` _ \\ / _\` | '__| __|   | |/ _ \\/ __| __| | |  _ / _ \\ '_ \\
  ___) | | | | | | (_| | |  | |_    | |  __/\\__ \\ |_  | |_| |  __/ | | |
 |____/|_| |_| |_|\\__,_|_|   \\__|   |_|\\___||___/\\__|  \\____|\___|_| |_|

 🧠 AI that writes better tests than you do (and 10x faster) 🚀
`;

console.log(chalk.cyan(banner));

program
  .name("test-gen")
  .description("Smart Test Generator - AI-powered test generation")
  .version("1.0.0")
  .helpOption("-h, --help", "Display help for command");

// Initialize command
program
  .command("init")
  .description("Initialize Smart Test Generator in your project")
  .option(
    "-f, --framework <framework>",
    "Testing framework (jest, vitest, cypress)",
    "jest"
  )
  .option(
    "-ai, --ai-provider <provider>",
    "AI provider (openai, anthropic, local)",
    "local"
  )
  .action(initCommand);

// Analyze command
program
  .command("analyze")
  .description("Analyze your codebase and identify testable functions")
  .argument("[paths...]", "Paths to analyze (default: src/)")
  .option("-o, --output <file>", "Output analysis results to file")
  .option("-v, --verbose", "Show detailed analysis")
  .action(analyzeCommand);

// Generate command
program
  .command("generate")
  .description("Generate comprehensive tests for your codebase")
  .option("-c, --coverage <number>", "Target coverage percentage", "90")
  .option("-t, --types <types...>", "Test types to generate", [
    "unit",
    "integration",
  ])
  .option("-f, --framework <framework>", "Testing framework override")
  .option("--dry-run", "Show what would be generated without creating files")
  .action(generateCommand);

// Watch command
program
  .command("watch")
  .description("Watch for file changes and auto-generate tests")
  .option("-d, --debounce <ms>", "Debounce delay in milliseconds", "1000")
  .option("--include <patterns...>", "File patterns to watch")
  .option("--exclude <patterns...>", "File patterns to exclude")
  .action(watchCommand);

// Dashboard command
program
  .command("dashboard")
  .description("Open the visual test management dashboard")
  .option("-p, --port <port>", "Port to run dashboard on", "3000")
  .option("--no-open", "Don't automatically open browser")
  .action(dashboardCommand);

// Config command
program
  .command("config")
  .description("Manage Smart Test Generator configuration")
  .argument("<action>", "Action (get, set, list)")
  .argument("[key]", "Configuration key")
  .argument("[value]", "Configuration value")
  .action(configCommand);

// Global error handler
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code === "commander.help") {
    process.exit(0);
  } else if (err.code === "commander.version") {
    process.exit(0);
  } else {
    console.error(chalk.red("❌ Error:"), err.message);
    process.exit(1);
  }
}

// Show help if no command provided
if (process.argv.length <= 2) {
  console.log(
    boxen(
      chalk.yellow("Welcome to Smart Test Generator!\\n\\n") +
        chalk.white("Quick Start:\\n") +
        chalk.cyan("  test-gen init") +
        chalk.gray("     # Initialize in your project\\n") +
        chalk.cyan("  test-gen analyze") +
        chalk.gray("   # Analyze your codebase\\n") +
        chalk.cyan("  test-gen generate") +
        chalk.gray("  # Generate comprehensive tests\\n") +
        chalk.cyan("  test-gen dashboard") +
        chalk.gray(" # Open visual dashboard\\n\\n") +
        chalk.white("For detailed help: ") +
        chalk.cyan("test-gen --help"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );
}
