import * as t from "@babel/types";
import { FrameworkInfo } from "./types";

export function detectFramework(
  content: string,
  imports: any[]
): FrameworkInfo {
  // React detection
  const hasReact =
    imports.some((imp) => imp.source === "react") || content.includes("React");
  const hasReactHooks = ["useState", "useEffect", "useContext"].some((hook) =>
    content.includes(hook)
  );
  const hasJSX = content.includes("<") && content.includes("/>");

  if (hasReact || hasReactHooks || hasJSX) {
    const features = [];
    if (hasReactHooks) features.push("hooks");
    if (hasJSX) features.push("jsx");

    return {
      type: "react",
      features,
      hooks: extractReactHooks(content),
    };
  }

  // Vue detection
  const hasVue =
    imports.some((imp) => imp.source === "vue") ||
    content.includes("createApp");
  if (hasVue) {
    return {
      type: "vue",
      features: ["composition-api"],
    };
  }

  // Express detection
  const hasExpress =
    imports.some((imp) => imp.source === "express") ||
    content.includes("app.get") ||
    content.includes("app.post") ||
    content.includes("req.") ||
    content.includes("res.");

  if (hasExpress) {
    return {
      type: "express",
      features: ["middleware", "routing"],
      middleware: extractExpressMiddleware(content),
    };
  }

  // Next.js detection
  const hasNext =
    imports.some((imp) => imp.source.includes("next")) ||
    content.includes("getServerSideProps") ||
    content.includes("getStaticProps");

  if (hasNext) {
    return {
      type: "next",
      features: ["ssr", "api-routes"],
    };
  }

  return {
    type: "generic",
    features: [],
  };
}

export function calculateComplexity(node: any): number {
  let complexity = 1; // Base complexity

  const visitor = {
    IfStatement: () => complexity++,
    ConditionalExpression: () => complexity++,
    LogicalExpression: () => complexity++,
    SwitchCase: () => complexity++,
    ForStatement: () => complexity++,
    ForInStatement: () => complexity++,
    ForOfStatement: () => complexity++,
    WhileStatement: () => complexity++,
    DoWhileStatement: () => complexity++,
    CatchClause: () => complexity++,
    Function: () => complexity++, // Nested functions
  };

  // Simple traversal for complexity calculation
  traverseForComplexity(node, visitor);

  return complexity;
}

function traverseForComplexity(node: any, visitor: any): void {
  if (!node || typeof node !== "object") return;

  // Check if this node type should increase complexity
  const nodeType = node.type;
  if (visitor[nodeType]) {
    visitor[nodeType]();
  }

  // Recursively traverse child nodes
  Object.values(node).forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => traverseForComplexity(item, visitor));
    } else if (child && typeof child === "object") {
      traverseForComplexity(child, visitor);
    }
  });
}

function extractReactHooks(content: string): string[] {
  const hookPattern = /use[A-Z][a-zA-Z]*/g;
  const matches = content.match(hookPattern);
  return matches ? [...new Set(matches)] : [];
}

function extractExpressMiddleware(content: string): string[] {
  const middlewarePattern =
    /app\.(use|get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  const middleware: string[] = [];
  let match;

  while ((match = middlewarePattern.exec(content)) !== null) {
    middleware.push(match[1]);
  }

  return [...new Set(middleware)];
}

export function generateMockData(type: string, name: string): any {
  const mockGenerators: Record<string, () => any> = {
    string: () => `mock-${name}`,
    number: () => Math.floor(Math.random() * 100),
    boolean: () => Math.random() > 0.5,
    array: () => [
      generateMockData("string", name),
      generateMockData("number", name),
    ],
    object: () => ({
      id: Math.floor(Math.random() * 1000),
      name: `mock-${name}`,
      active: true,
    }),
    function: () => ({ calls: [], mockReturnValue: (value: any) => value }),
    Promise: () => Promise.resolve(generateMockData("object", name)),
  };

  return mockGenerators[type] ? mockGenerators[type]() : null;
}

export function sanitizeTestName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function generateTestDescription(
  functionName: string,
  scenario: string
): string {
  const templates = {
    success: `should handle ${functionName} successfully`,
    error: `should handle ${functionName} error`,
    "edge-case": `should handle ${functionName} edge case`,
    async: `should handle async ${functionName}`,
    validation: `should validate ${functionName} inputs`,
  };

  return (
    templates[scenario as keyof typeof templates] ||
    `should test ${functionName}`
  );
}

export function isTestableFunction(func: any): boolean {
  // Skip constructor functions
  if (func.name === "constructor") return false;

  // Skip very simple functions (getters/setters)
  if (func.complexity < 2) return false;

  // Skip functions with too many side effects
  if (func.sideEffects.length > 5) return false;

  return true;
}

export function formatCode(code: string): string {
  return code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
