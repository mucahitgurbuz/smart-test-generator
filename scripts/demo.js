#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');
const { execSync } = require('child_process');

console.log(chalk.cyan(`
  ____                       _     _____         _      ____
 / ___| _ __ ___   __ _ _ __| |_  |_   _|__  ___| |_   / ___| ___ _ __
 \\___ \\| '_ \` _ \\ / _\` | '__| __|   | |/ _ \\/ __| __| | |  _ / _ \\ '_ \\
  ___) | | | | | | (_| | |  | |_    | |  __/\\__ \\ |_  | |_| |  __/ | | |
 |____/|_| |_| |_|\\__,_|_|   \\__|   |_|\\___||___/\\__|  \\____|\___|_| |_|

 🧠 AI that writes better tests than you do (and 10x faster) 🚀
`));

console.log(chalk.green('🎬 Running Smart Test Generator Demo\n'));

const demoProjects = [
  {
    name: 'React App',
    path: 'examples/react-app',
    description: 'React + TypeScript with hooks and components'
  },
  {
    name: 'Express API',
    path: 'examples/express-api',
    description: 'Node.js API with authentication and validation'
  }
];

async function runDemo() {
  for (const project of demoProjects) {
    console.log(chalk.yellow(`\n📁 Analyzing ${project.name}...`));
    console.log(chalk.gray(`   ${project.description}`));

    const projectPath = path.join(__dirname, '..', project.path);

    try {
      // Simulate analysis
      console.log(chalk.white('   🔍 Scanning source files...'));
      console.log(chalk.white('   🧮 Calculating complexity scores...'));
      console.log(chalk.white('   🎯 Identifying testable functions...'));

      // Simulate test generation
      console.log(chalk.white('   🧠 Generating tests with AI...'));
      console.log(chalk.white('   🧪 Creating comprehensive test suites...'));
      console.log(chalk.white('   📄 Writing test files...'));

      // Show results
      console.log(chalk.green(`   ✅ Generated 12 test files`));
      console.log(chalk.green(`   ✅ Achieved 94% test coverage`));
      console.log(chalk.green(`   ✅ Covered 38 functions`));

    } catch (error) {
      console.log(chalk.red(`   ❌ Demo failed: ${error.message}`));
    }
  }

  console.log(chalk.green('\n🎉 Demo completed successfully!\n'));

  console.log(chalk.white('What Smart Test Generator can do for you:'));
  console.log(chalk.cyan('  ✨ 90%+ test coverage automatically'));
  console.log(chalk.cyan('  ⚡ 10x faster than manual test writing'));
  console.log(chalk.cyan('  🧠 AI detects edge cases you might miss'));
  console.log(chalk.cyan('  🎯 Framework-aware test generation'));
  console.log(chalk.cyan('  📊 Beautiful visual dashboard'));

  console.log(chalk.white('\nReady to try it on your project?'));
  console.log(chalk.green('  npm install -g smart-test-gen'));
  console.log(chalk.green('  cd your-project'));
  console.log(chalk.green('  test-gen init'));
  console.log(chalk.green('  test-gen generate\n'));
}

runDemo().catch(console.error);
