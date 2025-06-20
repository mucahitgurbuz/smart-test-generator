const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function setupProject() {
  console.log('🚀 Setting up Smart Test Generator...\n');

  try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    await execAsync('npm install', { cwd: process.cwd() });
    console.log('✅ Dependencies installed\n');

    // Build core package
    console.log('🔨 Building core package...');
    await execAsync('npm run build', { cwd: path.join(process.cwd(), 'packages/core') });
    console.log('✅ Core package built\n');

    // Build CLI package
    console.log('🔨 Building CLI package...');
    await execAsync('npm run build', { cwd: path.join(process.cwd(), 'packages/cli') });
    console.log('✅ CLI package built\n');

    // Build dashboard (optional)
    try {
      console.log('🎨 Building dashboard...');
      await execAsync('npm run build', { cwd: path.join(process.cwd(), 'packages/dashboard') });
      console.log('✅ Dashboard built\n');
    } catch (error) {
      console.log('⚠️ Dashboard build failed (dependencies may be missing), but this is optional\n');
    }

    console.log('🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('  1. cd your-project');
    console.log('  2. npx smart-test-gen init');
    console.log('  3. npx smart-test-gen analyze src/');
    console.log('  4. npx smart-test-gen generate\n');
    console.log('For more help: npx smart-test-gen --help\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  - Make sure you have Node.js 16+ installed');
    console.log('  - Run: npm install');
    console.log('  - Check that all package.json files are present');
    process.exit(1);
  }
}

if (require.main === module) {
  setupProject();
}

module.exports = setupProject;
