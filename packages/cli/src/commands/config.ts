import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";

export async function configCommand(
  action: string,
  key?: string,
  value?: string
): Promise<void> {
  const projectRoot = process.cwd();
  const configPath = path.join(projectRoot, "test-gen.config.js");

  try {
    switch (action.toLowerCase()) {
      case "get":
        await getConfig(configPath, key);
        break;
      case "set":
        await setConfig(configPath, key, value);
        break;
      case "list":
        await listConfig(configPath);
        break;
      default:
        console.error(chalk.red("❌ Invalid action. Use: get, set, or list"));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red("❌ Configuration error:"), error);
    process.exit(1);
  }
}

async function getConfig(configPath: string, key?: string): Promise<void> {
  if (!(await fs.pathExists(configPath))) {
    console.error(
      chalk.red('❌ No configuration found. Run "test-gen init" first.')
    );
    return;
  }

  const config = require(configPath);

  if (!key) {
    console.log(
      chalk.yellow('Use "test-gen config list" to see all configuration.')
    );
    return;
  }

  const value = getNestedValue(config, key);
  if (value !== undefined) {
    console.log(chalk.green(`${key}:`), value);
  } else {
    console.log(chalk.red(`❌ Configuration key "${key}" not found.`));
  }
}

async function setConfig(
  configPath: string,
  key?: string,
  value?: string
): Promise<void> {
  if (!key || value === undefined) {
    console.error(
      chalk.red("❌ Both key and value are required for set operation.")
    );
    return;
  }

  if (!(await fs.pathExists(configPath))) {
    console.error(
      chalk.red('❌ No configuration found. Run "test-gen init" first.')
    );
    return;
  }

  // Read current config
  const configContent = await fs.readFile(configPath, "utf-8");
  const config = require(configPath);

  // Set the new value
  setNestedValue(config, key, parseValue(value));

  // Write back to file
  const newConfigContent = generateConfigFile(config);
  await fs.writeFile(configPath, newConfigContent);

  console.log(chalk.green(`✅ Set ${key} = ${value}`));
}

async function listConfig(configPath: string): Promise<void> {
  if (!(await fs.pathExists(configPath))) {
    console.error(
      chalk.red('❌ No configuration found. Run "test-gen init" first.')
    );
    return;
  }

  const config = require(configPath);

  console.log(chalk.green("📋 Smart Test Generator Configuration:\\n"));

  console.log(chalk.white("Project Settings:"));
  console.log(chalk.gray(`  rootDir: ${config.rootDir || "Not set"}`));
  console.log(chalk.gray(`  include: ${JSON.stringify(config.include || [])}`));
  console.log(chalk.gray(`  exclude: ${JSON.stringify(config.exclude || [])}`));

  console.log(chalk.white("\\nFramework:"));
  console.log(
    chalk.gray(`  type: ${config.framework?.type || "Not detected"}`)
  );
  console.log(
    chalk.gray(
      `  features: ${JSON.stringify(config.framework?.features || [])}`
    )
  );

  console.log(chalk.white("\\nTest Configuration:"));
  console.log(
    chalk.gray(`  framework: ${config.testConfig?.framework || "Not set"}`)
  );
  console.log(
    chalk.gray(`  coverage: ${config.testConfig?.coverage || "Not set"}%`)
  );
  console.log(
    chalk.gray(
      `  includeEdgeCases: ${config.testConfig?.includeEdgeCases || "Not set"}`
    )
  );
  console.log(
    chalk.gray(
      `  mockStrategy: ${config.testConfig?.mockStrategy || "Not set"}`
    )
  );
  console.log(
    chalk.gray(
      `  testTypes: ${JSON.stringify(config.testConfig?.testTypes || [])}`
    )
  );

  console.log(chalk.white("\\nAI Configuration:"));
  console.log(chalk.gray(`  provider: ${config.aiConfig?.name || "Not set"}`));
  console.log(chalk.gray(`  model: ${config.aiConfig?.model || "Not set"}`));
  console.log(
    chalk.gray(`  temperature: ${config.aiConfig?.temperature || "Not set"}`)
  );
  console.log(
    chalk.gray(`  maxTokens: ${config.aiConfig?.maxTokens || "Not set"}`)
  );
  console.log(
    chalk.gray(`  apiKey: ${config.aiConfig?.apiKey ? "****" : "Not set"}`)
  );

  console.log(
    chalk.cyan(
      '\\n💡 Tip: Use "test-gen config set <key> <value>" to update configuration'
    )
  );
  console.log(
    chalk.cyan("   Example: test-gen config set testConfig.coverage 95")
  );
}

function getNestedValue(obj: any, key: string): any {
  return key.split(".").reduce((o, k) => o?.[k], obj);
}

function setNestedValue(obj: any, key: string, value: any): void {
  const keys = key.split(".");
  const lastKey = keys.pop()!;
  const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
  target[lastKey] = value;
}

function parseValue(value: string): any {
  // Try to parse as JSON first
  try {
    return JSON.parse(value);
  } catch {
    // If not valid JSON, return as string
    return value;
  }
}

function generateConfigFile(config: any): string {
  return `module.exports = ${JSON.stringify(config, null, 2)};`;
}
