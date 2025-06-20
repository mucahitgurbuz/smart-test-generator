# 🚀 Quick Start Guide

Welcome to Smart Test Generator! This guide will get you up and running in 5 minutes.

## 🎯 What You'll Achieve

By the end of this guide, you'll have:

- ✅ Smart Test Generator installed and configured
- ✅ Your codebase analyzed for testable functions
- ✅ Comprehensive tests generated automatically
- ✅ 90%+ test coverage with minimal effort

## 📋 Prerequisites

- **Node.js 16+** ([Download here](https://nodejs.org/))
- **npm 8+** (comes with Node.js)
- **A JavaScript/TypeScript project** (React, Vue, Express, or plain JS/TS)

## ⚡ Installation

### Option 1: Global Installation (Recommended)

```bash
npm install -g smart-test-gen
```

### Option 2: Project Installation

```bash
npm install --save-dev smart-test-gen
```

## 🏁 First Run

### 1. Navigate to Your Project

```bash
cd your-awesome-project
```

### 2. Initialize Smart Test Generator

```bash
test-gen init
```

This interactive setup will:

- 🔍 Detect your project framework (React, Vue, Express, etc.)
- 🧪 Choose your testing framework (Jest, Vitest, Cypress)
- 🤖 Configure AI provider (OpenAI, Anthropic, or Local)
- 📊 Set coverage targets and test types

### 3. Analyze Your Codebase

```bash
test-gen analyze src/
```

This will:

- 📖 Parse all JavaScript/TypeScript files
- 🧮 Calculate complexity scores
- 🎯 Identify testable functions
- 📋 Generate analysis report

### 4. Generate Comprehensive Tests

```bash
test-gen generate --coverage 90
```

Watch as Smart Test Generator:

- 🧠 Uses AI to understand your code
- 🧪 Creates unit, integration, and component tests
- 🎭 Generates realistic mock data
- 🔍 Covers edge cases you might miss

### 5. Run Your New Tests

```bash
npm test
```

## 🎨 Visual Dashboard

For a beautiful web interface:

```bash
test-gen dashboard
```

This opens a React-based dashboard showing:

- 📊 Real-time test coverage visualization
- 📈 Code complexity analysis
- 🎯 Test generation suggestions
- ⚡ Quick actions for common tasks

## 🔄 Continuous Testing

Keep your tests up-to-date automatically:

```bash
test-gen watch
```

This monitors your files and:

- 👀 Watches for code changes
- 🔄 Regenerates tests automatically
- 📢 Shows real-time updates
- 🎯 Maintains high coverage

## 📚 Framework-Specific Examples

### React Project

```bash
cd my-react-app
test-gen init --framework jest --ai-provider openai
test-gen analyze src/components/
test-gen generate --types unit component
```

### Express API

```bash
cd my-express-api
test-gen init --framework jest --ai-provider anthropic
test-gen analyze src/routes/ src/middleware/
test-gen generate --types unit integration
```

### Vue Application

```bash
cd my-vue-app
test-gen init --framework vitest --ai-provider local
test-gen analyze src/components/ src/composables/
test-gen generate --coverage 95
```

## ⚙️ Configuration

### Quick Configuration Updates

```bash
# Set AI provider
test-gen config set aiConfig.name openai
test-gen config set aiConfig.apiKey your-api-key

# Adjust coverage target
test-gen config set testConfig.coverage 95

# Add test types
test-gen config set testConfig.testTypes '["unit", "integration", "e2e"]'
```

### Custom Configuration File

Create `test-gen.config.js` in your project root:

```javascript
module.exports = {
  include: ["src/**/*.{js,ts,jsx,tsx}"],
  exclude: ["**/*.test.{js,ts}", "node_modules/**"],

  testConfig: {
    framework: "jest",
    coverage: 90,
    testTypes: ["unit", "integration"],
    mockStrategy: "auto",
  },

  aiConfig: {
    name: "openai",
    model: "gpt-4",
    temperature: 0.2,
  },
};
```

## 🎯 Pro Tips

### 1. Start with High-Value Files

```bash
# Analyze specific directories first
test-gen analyze src/components/ src/utils/
```

### 2. Use Dry Run to Preview

```bash
# See what would be generated without creating files
test-gen generate --dry-run
```

### 3. Incremental Coverage Improvement

```bash
# Start with 70% coverage, then increase
test-gen generate --coverage 70
# Review and improve, then increase
test-gen generate --coverage 85
```

### 4. Combine with Your Existing Tests

Smart Test Generator works alongside your existing tests. It:

- ❌ Won't overwrite existing test files
- ✅ Generates tests for uncovered code
- 🔄 Updates tests when code changes
- 📊 Respects your current test patterns

## 🚨 Troubleshooting

### "No configuration found"

```bash
# Initialize first
test-gen init
```

### "No testable functions found"

```bash
# Check your include/exclude patterns
test-gen config get include
test-gen config set include '["src/**/*.{js,ts,jsx,tsx}"]'
```

### "AI provider error"

```bash
# Check your API key
test-gen config set aiConfig.apiKey your-actual-api-key
# Or use local mode
test-gen config set aiConfig.name local
```

### Tests not running

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react
# Or
npm install --save-dev vitest
```

## 📊 Expected Results

After running Smart Test Generator, you should see:

- **90%+ test coverage** (vs typical 30-40%)
- **Edge cases covered** that you might have missed
- **Realistic mock data** instead of generic "foo", "bar"
- **Framework-specific tests** (React hooks, Express middleware, etc.)
- **Clean, maintainable test code** following best practices

## 🔮 What's Next?

1. **Explore the Dashboard**: `test-gen dashboard`
2. **Try Different Frameworks**: See examples in `/examples`
3. **Configure CI/CD**: Add to your GitHub Actions
4. **Join the Community**: Share your experience!

## 🆘 Need Help?

- 📖 **Documentation**: [Full docs](docs/)
- 💬 **GitHub Discussions**: Ask questions
- 🐛 **Issues**: Report bugs
- 💌 **Email**: mucahitgurbuz@gmail.com

---

**You're all set!** Smart Test Generator will save you hours of test writing while improving your code quality. Happy testing! 🎉
