import * as fs from 'fs-extra';
import * as path from 'path';
import { AnalysisResult, FunctionInfo, GeneratedTest, TestGenerationConfig, TestType } from './types';
import { BaseAIProvider, createAIProvider } from './ai-provider';
import { TestTemplate } from './templates';
import { generateMockData, sanitizeTestName, generateTestDescription, isTestableFunction } from './utils';

export class TestGenerator {
  private aiProvider: BaseAIProvider;
  private config: TestGenerationConfig;
  private template: TestTemplate;

  constructor(config: TestGenerationConfig) {
    this.config = config;
    this.aiProvider = createAIProvider(config.aiProvider);
    this.template = new TestTemplate(config.framework);
  }

  async generateTests(analysisResults: AnalysisResult[]): Promise<GeneratedTest[]> {
    const generatedTests: GeneratedTest[] = [];

    for (const result of analysisResults) {
      try {
        const tests = await this.generateTestsForFile(result);
        generatedTests.push(...tests);
      } catch (error) {
        console.warn(`Failed to generate tests for ${result.filePath}:`, error);
      }
    }

    return generatedTests;
  }

  async generateTestsForFile(analysis: AnalysisResult): Promise<GeneratedTest[]> {
    const tests: GeneratedTest[] = [];
    const testableFunctions = analysis.functions.filter(isTestableFunction);

    if (testableFunctions.length === 0) {
      return tests;
    }

    // Generate different types of tests based on configuration
    for (const testType of this.config.testTypes) {
      const test = await this.generateTestByType(analysis, testableFunctions, testType);
      if (test) {
        tests.push(test);
      }
    }

    return tests;
  }

  private async generateTestByType(
    analysis: AnalysisResult,
    functions: FunctionInfo[],
    testType: TestType
  ): Promise<GeneratedTest | null> {
    const prompt = this.buildPrompt(analysis, functions, testType);

    try {
      const aiResponse = await this.aiProvider.generateTest(prompt);
      const testContent = this.template.wrapTest(aiResponse.content, {
        fileName: path.basename(analysis.filePath),
        testType,
        imports: analysis.imports,
        framework: analysis.framework
      });

      const testFileName = this.generateTestFileName(analysis.filePath, testType);

      return {
        filePath: testFileName,
        content: testContent,
        framework: this.config.framework,
        testType,
        coverage: this.estimateCoverage(functions, aiResponse.content),
        functions: functions.map(f => f.name)
      };
    } catch (error) {
      console.warn(`Failed to generate ${testType} test:`, error);
      return null;
    }
  }

  private buildPrompt(analysis: AnalysisResult, functions: FunctionInfo[], testType: TestType): string {
    const sourceFile = path.basename(analysis.filePath);
    const framework = analysis.framework.type;

    let prompt = `Generate comprehensive ${testType} tests for the following ${framework} code:

File: ${sourceFile}
Framework: ${framework}
Test Framework: ${this.config.framework}

Functions to test:
${functions.map(f => this.describeFunctionForAI(f)).join('\n')}

`;

    // Add framework-specific context
    if (framework === 'react') {
      prompt += this.addReactContext(analysis);
    } else if (framework === 'express') {
      prompt += this.addExpressContext(analysis);
    } else if (framework === 'vue') {
      prompt += this.addVueContext(analysis);
    }

    // Add test type specific requirements
    prompt += this.addTestTypeRequirements(testType);

    // Add mock strategy
    prompt += this.addMockingStrategy();

    return prompt;
  }

  private describeFunctionForAI(func: FunctionInfo): string {
    let description = `- ${func.name}(${func.params.map(p => `${p.name}: ${p.type}`).join(', ')})`;

    if (func.isAsync) description += ' [ASYNC]';
    if (func.complexity > 5) description += ' [COMPLEX]';

    description += ` -> ${func.returnType}`;

    if (func.sideEffects.length > 0) {
      description += `\n  Side effects: ${func.sideEffects.map(se => se.description).join(', ')}`;
    }

    if (func.dependencies.length > 0) {
      description += `\n  Dependencies: ${func.dependencies.join(', ')}`;
    }

    if (func.framework) {
      description += `\n  Framework features: ${func.framework.features?.join(', ') || 'none'}`;
      if (func.framework.hooks) {
        description += `\n  React hooks: ${func.framework.hooks.join(', ')}`;
      }
    }

    return description;
  }

  private addReactContext(analysis: AnalysisResult): string {
    const hasHooks = analysis.functions.some(f => f.framework?.hooks?.length);
    const hasJSX = analysis.framework.features?.includes('jsx');

    let context = `
React-specific requirements:
- Use @testing-library/react for component testing
- Mock React hooks appropriately
`;

    if (hasHooks) {
      context += `- Test hook behavior and state changes
- Use act() for state updates
`;
    }

    if (hasJSX) {
      context += `- Test component rendering and props
- Test user interactions and events
- Check accessibility attributes
`;
    }

    return context;
  }

  private addExpressContext(analysis: AnalysisResult): string {
    return `
Express-specific requirements:
- Use supertest for HTTP endpoint testing
- Mock database calls and external APIs
- Test middleware behavior
- Validate request/response handling
- Test error handling and status codes
- Include authentication/authorization scenarios if applicable
`;
  }

  private addVueContext(analysis: AnalysisResult): string {
    return `
Vue-specific requirements:
- Use @vue/test-utils for component testing
- Test component props and emits
- Test computed properties and watchers
- Mock Vue composition API functions
- Test component lifecycle hooks
`;
  }

  private addTestTypeRequirements(testType: TestType): string {
    const requirements = {
      unit: `
Unit Test Requirements:
- Test individual functions in isolation
- Mock all external dependencies
- Focus on input/output behavior
- Test edge cases and error conditions
- Achieve high code coverage
`,
      integration: `
Integration Test Requirements:
- Test interaction between multiple components/modules
- Use real implementations where possible
- Test data flow and communication
- Include end-to-end scenarios within the module
- Test error propagation
`,
      e2e: `
E2E Test Requirements:
- Test complete user workflows
- Use real browser interactions
- Test across different screen sizes
- Include loading states and error scenarios
- Test with real data where possible
`,
      component: `
Component Test Requirements:
- Test component in isolation with mocked dependencies
- Test all props and their combinations
- Test user interactions and events
- Test conditional rendering
- Test component state changes
`
    };

    return requirements[testType] || '';
  }

  private addMockingStrategy(): string {
    if (this.config.mockStrategy === 'auto') {
      return `
Mocking Strategy:
- Automatically mock external dependencies (APIs, databases, file system)
- Generate realistic mock data based on function signatures
- Use smart mocking for complex objects
- Preserve function behavior while isolating side effects
`;
    } else if (this.config.mockStrategy === 'manual') {
      return `
Mocking Strategy:
- Provide manual mock implementations
- Include mock setup and teardown
- Allow for custom mock behavior configuration
`;
    }

    return '';
  }

  private generateTestFileName(sourceFile: string, testType: TestType): string {
    const ext = path.extname(sourceFile);
    const baseName = path.basename(sourceFile, ext);
    const dir = path.dirname(sourceFile);

    let suffix = 'test';
    if (testType === 'integration') suffix = 'integration.test';
    else if (testType === 'e2e') suffix = 'e2e.test';
    else if (testType === 'component') suffix = 'component.test';

    return path.join(dir, '__tests__', `${baseName}.${suffix}${ext}`);
  }

  private estimateCoverage(functions: FunctionInfo[], generatedTest: string): number {
    const functionNames = functions.map(f => f.name);
    const testContent = generatedTest.toLowerCase();

    const coveredFunctions = functionNames.filter(name =>
      testContent.includes(name.toLowerCase())
    );

    return Math.round((coveredFunctions.length / functionNames.length) * 100);
  }

  async writeTestFiles(tests: GeneratedTest[]): Promise<void> {
    for (const test of tests) {
      try {
        const dir = path.dirname(test.filePath);
        await fs.ensureDir(dir);
        await fs.writeFile(test.filePath, test.content, 'utf-8');
        console.log(`Generated test: ${test.filePath}`);
      } catch (error) {
        console.error(`Failed to write test file ${test.filePath}:`, error);
      }
    }
  }

  async generateMockData(schema: any): Promise<any> {
    if (this.config.mockStrategy === 'none') {
      return null;
    }

    try {
      const response = await this.aiProvider.generateMockData(schema);
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback to basic mock generation
      return generateMockData('object', 'mockData');
    }
  }

  getGenerationStats(tests: GeneratedTest[]): any {
    const stats = {
      totalTests: tests.length,
      byType: {} as Record<TestType, number>,
      byFramework: {} as Record<string, number>,
      avgCoverage: 0,
      totalFunctions: 0
    };

    tests.forEach(test => {
      stats.byType[test.testType] = (stats.byType[test.testType] || 0) + 1;
      stats.byFramework[test.framework] = (stats.byFramework[test.framework] || 0) + 1;
      stats.totalFunctions += test.functions.length;
    });

    stats.avgCoverage = tests.reduce((sum, test) => sum + test.coverage, 0) / tests.length || 0;

    return stats;
  }
}
