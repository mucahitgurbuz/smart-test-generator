import { FrameworkInfo, ImportInfo } from './types';

export interface TemplateContext {
  fileName: string;
  testType: string;
  imports: ImportInfo[];
  framework: FrameworkInfo;
}

export class TestTemplate {
  private framework: string;

  constructor(framework: string) {
    this.framework = framework;
  }

  wrapTest(content: string, context: TemplateContext): string {
    const template = this.getTemplate();

    return template
      .replace('{{IMPORTS}}', this.generateImports(context))
      .replace('{{SETUP}}', this.generateSetup(context))
      .replace('{{TESTS}}', content)
      .replace('{{TEARDOWN}}', this.generateTeardown(context));
  }

  private getTemplate(): string {
    switch (this.framework) {
      case 'jest':
        return this.getJestTemplate();
      case 'vitest':
        return this.getVitestTemplate();
      case 'cypress':
        return this.getCypressTemplate();
      default:
        return this.getJestTemplate();
    }
  }

  private getJestTemplate(): string {
    return `{{IMPORTS}}

{{SETUP}}

{{TESTS}}

{{TEARDOWN}}`;
  }

  private getVitestTemplate(): string {
    return `{{IMPORTS}}

{{SETUP}}

{{TESTS}}

{{TEARDOWN}}`;
  }

  private getCypressTemplate(): string {
    return `{{IMPORTS}}

{{SETUP}}

{{TESTS}}

{{TEARDOWN}}`;
  }

  private generateImports(context: TemplateContext): string {
    const imports: string[] = [];

    // Add testing framework imports
    if (this.framework === 'jest') {
      imports.push("import { jest } from '@jest/globals';");
    } else if (this.framework === 'vitest') {
      imports.push("import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';");
    }

    // Add framework-specific testing utilities
    if (context.framework.type === 'react') {
      imports.push("import { render, screen, fireEvent, waitFor } from '@testing-library/react';");
      imports.push("import { act } from 'react-dom/test-utils';");
      if (context.testType === 'component') {
        imports.push("import '@testing-library/jest-dom';");
      }
    } else if (context.framework.type === 'express') {
      imports.push("import request from 'supertest';");
    } else if (context.framework.type === 'vue') {
      imports.push("import { mount, shallowMount } from '@vue/test-utils';");
    }

    // Add source file import
    const sourcePath = this.getSourcePath(context.fileName);
    imports.push(`import * as sourceModule from '${sourcePath}';`);

    return imports.join('\n');
  }

  private generateSetup(context: TemplateContext): string {
    const setup: string[] = [];

    if (context.framework.type === 'react') {
      setup.push(`
// Mock React hooks and components
const mockSetState = jest.fn();
const mockUseState = jest.fn(() => [null, mockSetState]);
const mockUseEffect = jest.fn();

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: mockUseState,
  useEffect: mockUseEffect
}));`);
    } else if (context.framework.type === 'express') {
      setup.push(`
// Mock database and external services
const mockDatabase = {
  find: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const mockExternalAPI = {
  get: jest.fn(),
  post: jest.fn()
};`);
    }

    setup.push(`
beforeEach(() => {
  jest.clearAllMocks();
});`);

    return setup.join('\n');
  }

  private generateTeardown(context: TemplateContext): string {
    return `
afterEach(() => {
  jest.resetAllMocks();
});`;
  }

  private getSourcePath(fileName: string): string {
    // Remove extension and add relative path
    const baseName = fileName.replace(/\.(js|ts|jsx|tsx)$/, '');
    return `../${baseName}`;
  }
}

export const JEST_TEMPLATES = {
  unit: `
describe('{{FUNCTION_NAME}}', () => {
  test('should handle successful execution', () => {
    // Arrange
    const input = {{MOCK_INPUT}};
    const expected = {{EXPECTED_OUTPUT}};

    // Act
    const result = {{FUNCTION_NAME}}(input);

    // Assert
    expect(result).toEqual(expected);
  });

  test('should handle error conditions', () => {
    // Arrange
    const invalidInput = {{INVALID_INPUT}};

    // Act & Assert
    expect(() => {{FUNCTION_NAME}}(invalidInput)).toThrow();
  });

  test('should handle edge cases', () => {
    // Test empty input
    expect({{FUNCTION_NAME}}()).toBeDefined();

    // Test null input
    expect({{FUNCTION_NAME}}(null)).toBeDefined();

    // Test undefined input
    expect({{FUNCTION_NAME}}(undefined)).toBeDefined();
  });
});`,

  integration: `
describe('{{MODULE_NAME}} Integration Tests', () => {
  test('should integrate with external dependencies', async () => {
    // Setup integration test scenario
    const integrationData = {{INTEGRATION_DATA}};

    // Test the integration
    const result = await {{FUNCTION_NAME}}(integrationData);

    expect(result).toBeDefined();
  });
});`,

  component: `
describe('{{COMPONENT_NAME}} Component', () => {
  test('should render without crashing', () => {
    render(<{{COMPONENT_NAME}} />);
  });

  test('should handle props correctly', () => {
    const props = {{MOCK_PROPS}};
    render(<{{COMPONENT_NAME}} {...props} />);

    expect(screen.getByTestId('{{TEST_ID}}')).toBeInTheDocument();
  });

  test('should handle user interactions', async () => {
    render(<{{COMPONENT_NAME}} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('{{EXPECTED_TEXT}}')).toBeInTheDocument();
    });
  });
});`
};

export const VITEST_TEMPLATES = {
  unit: `
describe('{{FUNCTION_NAME}}', () => {
  it('should handle successful execution', () => {
    // Arrange
    const input = {{MOCK_INPUT}};
    const expected = {{EXPECTED_OUTPUT}};

    // Act
    const result = {{FUNCTION_NAME}}(input);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should handle error conditions', () => {
    // Arrange
    const invalidInput = {{INVALID_INPUT}};

    // Act & Assert
    expect(() => {{FUNCTION_NAME}}(invalidInput)).toThrow();
  });
});`
};

export const CYPRESS_TEMPLATES = {
  e2e: `
describe('{{FEATURE_NAME}} E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/{{PAGE_URL}}');
  });

  it('should complete user workflow', () => {
    // Test user journey
    cy.get('[data-testid="{{ELEMENT_ID}}"]').click();
    cy.get('[data-testid="{{INPUT_ID}}"]').type('{{TEST_DATA}}');
    cy.get('[data-testid="{{SUBMIT_ID}}"]').click();

    // Verify results
    cy.get('[data-testid="{{RESULT_ID}}"]').should('contain', '{{EXPECTED_TEXT}}');
  });

  it('should handle error scenarios', () => {
    // Test error handling
    cy.get('[data-testid="{{INPUT_ID}}"]').type('{{INVALID_DATA}}');
    cy.get('[data-testid="{{SUBMIT_ID}}"]').click();

    cy.get('[data-testid="{{ERROR_ID}}"]').should('be.visible');
  });
});`
};
