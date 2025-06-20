import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from './types';

export interface AIResponse {
  content: string;
  tokens: number;
  model: string;
}

export abstract class BaseAIProvider {
  protected config: AIProvider;

  constructor(config: AIProvider) {
    this.config = config;
  }

  abstract generateTest(prompt: string): Promise<AIResponse>;
  abstract generateMockData(schema: any): Promise<AIResponse>;
  abstract explainCode(code: string): Promise<AIResponse>;
}

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: AIProvider) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY
    });
  }

  async generateTest(prompt: string): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const content = response.choices[0]?.message?.content || '';
      const tokens = response.usage?.total_tokens || 0;

      return {
        content,
        tokens,
        model: this.config.model
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  async generateMockData(schema: any): Promise<AIResponse> {
    const prompt = `Generate realistic mock data for this schema: ${JSON.stringify(schema, null, 2)}`;
    return this.generateTest(prompt);
  }

  async explainCode(code: string): Promise<AIResponse> {
    const prompt = `Explain what this code does and identify potential test cases:\n\n${code}`;
    return this.generateTest(prompt);
  }

  private getSystemPrompt(): string {
    return `You are an expert software testing engineer specializing in JavaScript/TypeScript test generation.

Your task is to generate comprehensive, realistic, and maintainable tests that cover:
1. Happy path scenarios
2. Error handling and edge cases
3. Boundary conditions
4. Asynchronous operations
5. Mock implementations for external dependencies

Guidelines:
- Generate clean, readable test code
- Use proper assertions and expectations
- Include realistic mock data (avoid "foo", "bar" placeholders)
- Follow testing best practices
- Cover both positive and negative test cases
- Consider the specific framework being used (React, Express, etc.)
- Include proper setup and teardown when needed
- Write descriptive test names and comments

Always return only the test code without explanations unless specifically asked.`;
  }
}

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(config: AIProvider) {
    super(config);
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY
    });
  }

  async generateTest(prompt: string): Promise<AIResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: `${this.getSystemPrompt()}\n\n${prompt}`
          }
        ]
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      const tokens = response.usage?.input_tokens + response.usage?.output_tokens || 0;

      return {
        content,
        tokens,
        model: this.config.model
      };
    } catch (error) {
      throw new Error(`Anthropic API error: ${error}`);
    }
  }

  async generateMockData(schema: any): Promise<AIResponse> {
    const prompt = `Generate realistic mock data for this schema: ${JSON.stringify(schema, null, 2)}`;
    return this.generateTest(prompt);
  }

  async explainCode(code: string): Promise<AIResponse> {
    const prompt = `Explain what this code does and identify potential test cases:\n\n${code}`;
    return this.generateTest(prompt);
  }

  private getSystemPrompt(): string {
    return `You are an expert software testing engineer specializing in JavaScript/TypeScript test generation.

Your task is to generate comprehensive, realistic, and maintainable tests that cover:
1. Happy path scenarios
2. Error handling and edge cases
3. Boundary conditions
4. Asynchronous operations
5. Mock implementations for external dependencies

Guidelines:
- Generate clean, readable test code
- Use proper assertions and expectations
- Include realistic mock data (avoid "foo", "bar" placeholders)
- Follow testing best practices
- Cover both positive and negative test cases
- Consider the specific framework being used (React, Express, etc.)
- Include proper setup and teardown when needed
- Write descriptive test names and comments

Always return only the test code without explanations unless specifically asked.`;
  }
}

export class LocalProvider extends BaseAIProvider {
  async generateTest(prompt: string): Promise<AIResponse> {
    // Fallback implementation for offline usage
    const basicTest = this.generateBasicTest(prompt);

    return {
      content: basicTest,
      tokens: 0,
      model: 'local'
    };
  }

  async generateMockData(schema: any): Promise<AIResponse> {
    const mockData = this.generateBasicMockData(schema);

    return {
      content: JSON.stringify(mockData, null, 2),
      tokens: 0,
      model: 'local'
    };
  }

  async explainCode(code: string): Promise<AIResponse> {
    return {
      content: 'Code analysis requires AI provider configuration.',
      tokens: 0,
      model: 'local'
    };
  }

  private generateBasicTest(prompt: string): string {
    return `
describe('Generated Test Suite', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('should handle function execution', () => {
    // TODO: Implement actual test logic
    // This is a basic template - configure AI provider for intelligent test generation
  });
});
    `.trim();
  }

  private generateBasicMockData(schema: any): any {
    return {
      id: 1,
      name: 'Test Data',
      created: new Date().toISOString(),
      active: true
    };
  }
}

export function createAIProvider(config: AIProvider): BaseAIProvider {
  switch (config.name) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'ollama':
    case 'gemini':
      // TODO: Implement additional providers
      return new LocalProvider(config);
    default:
      return new LocalProvider(config);
  }
}
