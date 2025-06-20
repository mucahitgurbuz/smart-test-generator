export interface FunctionInfo {
  name: string;
  params: Parameter[];
  returnType: string;
  isAsync: boolean;
  complexity: number;
  dependencies: string[];
  sideEffects: SideEffect[];
  framework?: FrameworkInfo;
}

export interface Parameter {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: any;
}

export interface SideEffect {
  type: 'api-call' | 'database' | 'filesystem' | 'external-service' | 'state-mutation';
  description: string;
  mockable: boolean;
}

export interface FrameworkInfo {
  type: 'react' | 'vue' | 'express' | 'next' | 'generic';
  features: string[];
  hooks?: string[];
  middleware?: string[];
  components?: string[];
}

export interface AnalysisResult {
  filePath: string;
  functions: FunctionInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  framework: FrameworkInfo;
  testability: TestabilityScore;
}

export interface ImportInfo {
  name: string;
  source: string;
  type: 'default' | 'named' | 'namespace';
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'class' | 'constant' | 'component';
}

export interface TestabilityScore {
  overall: number;
  complexity: number;
  dependencies: number;
  sideEffects: number;
  coverage: number;
}

export interface TestGenerationConfig {
  framework: 'jest' | 'vitest' | 'cypress';
  coverage: number;
  includeEdgeCases: boolean;
  mockStrategy: 'auto' | 'manual' | 'none';
  testTypes: TestType[];
  aiProvider: AIProvider;
}

export type TestType = 'unit' | 'integration' | 'e2e' | 'component';

export interface AIProvider {
  name: 'openai' | 'anthropic' | 'gemini' | 'ollama';
  model: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
}

export interface GeneratedTest {
  filePath: string;
  content: string;
  framework: string;
  testType: TestType;
  coverage: number;
  functions: string[];
}

export interface TestSuite {
  name: string;
  tests: GeneratedTest[];
  totalCoverage: number;
  executionTime: number;
  stats: TestStats;
}

export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

export interface ProjectConfig {
  rootDir: string;
  include: string[];
  exclude: string[];
  framework: FrameworkInfo;
  testConfig: TestGenerationConfig;
  aiConfig: AIProvider;
}
