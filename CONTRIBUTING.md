# Contributing to Smart Test Generator

We love contributions! This document provides guidelines for contributing to Smart Test Generator.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-test-generator.git
   cd smart-test-generator
   ```
3. **Install dependencies**:
   ```bash
   npm run bootstrap
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🏗️ Development Setup

### Prerequisites
- Node.js 16+
- npm 8+
- Git

### Project Structure
```
smart-test-generator/
├── packages/
│   ├── core/           # Core analysis engine
│   ├── cli/            # Command line interface
│   ├── dashboard/      # React dashboard
│   └── plugins/        # Framework plugins
├── examples/           # Example projects
├── templates/          # Test templates
└── docs/              # Documentation
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests for specific package
npm run test:core
npm run test:cli

# Run tests in watch mode
npm run test:watch
```

### Building the Project
```bash
# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:cli
npm run build:dashboard
```

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Provide proper type definitions
- Avoid `any` types when possible
- Use meaningful variable and function names

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Maximum line length: 100 characters
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces

### Testing
- Write tests for all new features
- Maintain >90% code coverage
- Use descriptive test names
- Test both success and error scenarios

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected behavior**
4. **Actual behavior**
5. **Environment details**:
   - OS and version
   - Node.js version
   - Smart Test Generator version
   - Project framework (React, Express, etc.)

## ✨ Feature Requests

For feature requests, please provide:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Use cases** - Who would benefit from this?
4. **Implementation ideas** - Any technical details

## 🔧 Development Workflow

### Adding New Features

1. **Create an issue** describing the feature
2. **Wait for approval** from maintainers
3. **Create a branch** from `main`
4. **Implement the feature** with tests
5. **Update documentation** if needed
6. **Submit a pull request**

### Pull Request Process

1. **Ensure all tests pass**
2. **Update documentation** for new features
3. **Add/update examples** if applicable
4. **Follow commit message format**:
   ```
   type(scope): description

   feat(core): add support for Vue 3 composition API
   fix(cli): handle missing config file gracefully
   docs(readme): update installation instructions
   ```

### Commit Message Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🏷️ Framework Support

### Adding New Framework Support

To add support for a new framework:

1. **Create a plugin** in `packages/plugins/`
2. **Add detection logic** in `packages/core/src/utils.ts`
3. **Create test templates** in `templates/`
4. **Add example project** in `examples/`
5. **Update documentation**

### Plugin Structure
```typescript
export class NewFrameworkPlugin implements FrameworkPlugin {
  name = 'new-framework';

  detect(code: string, imports: ImportInfo[]): boolean {
    // Detection logic
  }

  analyze(ast: any): FrameworkInfo {
    // Analysis logic
  }

  generateTests(analysis: AnalysisResult): string {
    // Test generation logic
  }
}
```

## 🧪 Testing New Features

### Test Categories
1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete workflows
4. **Example Tests**: Test with real projects

### Test Data
- Use realistic test data
- Avoid generic names like "foo", "bar"
- Include edge cases and error scenarios
- Test with different framework versions

## 📚 Documentation

### Documentation Standards
- Use clear, concise language
- Include code examples
- Provide real-world use cases
- Keep documentation up-to-date

### Documentation Types
- **API Documentation**: Function signatures and parameters
- **Guides**: Step-by-step tutorials
- **Examples**: Working code samples
- **README**: Project overview and quick start

## 🤝 Community

### Getting Help
- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time chat (link in README)

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Please be respectful and inclusive.

## 🎯 Priorities

Current priorities for contributions:

1. **Framework Support**: Vue 3, Svelte, Angular
2. **Test Frameworks**: Playwright, Testing Library
3. **AI Providers**: Local models, custom providers
4. **IDE Integration**: VS Code extension
5. **Performance**: Faster analysis and generation

## 📋 Checklist

Before submitting a pull request:

- [ ] Tests pass (`npm test`)
- [ ] Code follows style guidelines (`npm run lint`)
- [ ] Documentation updated
- [ ] Example added/updated if applicable
- [ ] Changes tested with example projects
- [ ] Backwards compatibility maintained
- [ ] Performance impact considered

## 🙏 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page
- Annual contributor appreciation

---

Thank you for contributing to Smart Test Generator! Your help makes testing better for everyone. 🚀
