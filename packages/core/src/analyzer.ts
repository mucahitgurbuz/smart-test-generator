import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import * as fs from "fs-extra";
import * as path from "path";
import { glob } from "glob";
import {
  AnalysisResult,
  FunctionInfo,
  FrameworkInfo,
  Parameter,
  SideEffect,
  TestabilityScore,
} from "./types";
import { detectFramework, calculateComplexity } from "./utils";

export class CodeAnalyzer {
  private rootDir: string;
  private includePatterns: string[];
  private excludePatterns: string[];

  constructor(
    rootDir: string,
    options: {
      include?: string[];
      exclude?: string[];
    } = {}
  ) {
    this.rootDir = rootDir;
    this.includePatterns = options.include || ["**/*.{js,ts,jsx,tsx}"];
    this.excludePatterns = options.exclude || [
      "**/*.test.{js,ts}",
      "**/*.spec.{js,ts}",
      "node_modules/**",
    ];
  }

  async analyzeProject(): Promise<AnalysisResult[]> {
    const files = await this.findSourceFiles();
    const results: AnalysisResult[] = [];

    for (const filePath of files) {
      try {
        const result = await this.analyzeFile(filePath);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to analyze ${filePath}:`, error);
      }
    }

    return results;
  }

  async analyzeFile(filePath: string): Promise<AnalysisResult> {
    const content = await fs.readFile(filePath, "utf-8");
    const ast = this.parseCode(content, filePath);

    const functions: FunctionInfo[] = [];
    const imports: any[] = [];
    const exports: any[] = [];

    traverse(ast, {
      FunctionDeclaration: (path: NodePath<t.FunctionDeclaration>) => {
        const func = this.analyzeFunctionDeclaration(path.node, content);
        if (func) functions.push(func);
      },

      ArrowFunctionExpression: (path: NodePath<t.ArrowFunctionExpression>) => {
        const func = this.analyzeArrowFunction(path.node, path.parent, content);
        if (func) functions.push(func);
      },

      FunctionExpression: (path: NodePath<t.FunctionExpression>) => {
        const func = this.analyzeFunctionExpression(
          path.node,
          path.parent,
          content
        );
        if (func) functions.push(func);
      },

      ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
        imports.push(this.analyzeImport(path.node));
      },

      ExportNamedDeclaration: (path: NodePath<t.ExportNamedDeclaration>) => {
        exports.push(...this.analyzeExport(path.node));
      },

      ExportDefaultDeclaration: (
        path: NodePath<t.ExportDefaultDeclaration>
      ) => {
        exports.push(this.analyzeDefaultExport(path.node));
      },
    });

    const framework = detectFramework(content, imports);

    return {
      filePath,
      functions,
      imports,
      exports,
      framework,
      testability: this.calculateTestability(functions),
    };
  }

  private parseCode(content: string, filePath: string) {
    const isTypeScript = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
    const isJSX = filePath.endsWith(".jsx") || filePath.endsWith(".tsx");

    return parser.parse(content, {
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: [
        "asyncGenerators",
        "bigInt",
        "classProperties",
        "decorators-legacy",
        "doExpressions",
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "functionBind",
        "functionSent",
        "importMeta",
        "nullishCoalescingOperator",
        "numericSeparator",
        "objectRestSpread",
        "optionalCatchBinding",
        "optionalChaining",
        "throwExpressions",
        "topLevelAwait",
        ...(isTypeScript ? ["typescript" as const] : []),
        ...(isJSX ? ["jsx" as const] : []),
      ],
    });
  }

  private analyzeFunctionDeclaration(
    node: t.FunctionDeclaration,
    content: string
  ): FunctionInfo | null {
    if (!node.id) return null;

    return {
      name: node.id.name,
      params: this.extractParameters(node.params),
      returnType: this.inferReturnType(node),
      isAsync: node.async,
      complexity: calculateComplexity(node),
      dependencies: this.extractDependencies(node),
      sideEffects: this.detectSideEffects(node, content),
      framework: this.detectFunctionFramework(node, content),
    };
  }

  private analyzeArrowFunction(
    node: t.ArrowFunctionExpression,
    parent: t.Node,
    content: string
  ): FunctionInfo | null {
    let name = "anonymous";

    if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
      name = parent.id.name;
    } else if (t.isProperty(parent) && t.isIdentifier(parent.key)) {
      name = parent.key.name;
    }

    if (name === "anonymous") return null;

    return {
      name,
      params: this.extractParameters(node.params),
      returnType: this.inferReturnType(node),
      isAsync: node.async,
      complexity: calculateComplexity(node),
      dependencies: this.extractDependencies(node),
      sideEffects: this.detectSideEffects(node, content),
      framework: this.detectFunctionFramework(node, content),
    };
  }

  private analyzeFunctionExpression(
    node: t.FunctionExpression,
    parent: t.Node,
    content: string
  ): FunctionInfo | null {
    let name = node.id?.name || "anonymous";

    if (
      name === "anonymous" &&
      t.isVariableDeclarator(parent) &&
      t.isIdentifier(parent.id)
    ) {
      name = parent.id.name;
    }

    if (name === "anonymous") return null;

    return {
      name,
      params: this.extractParameters(node.params),
      returnType: this.inferReturnType(node),
      isAsync: node.async,
      complexity: calculateComplexity(node),
      dependencies: this.extractDependencies(node),
      sideEffects: this.detectSideEffects(node, content),
      framework: this.detectFunctionFramework(node, content),
    };
  }

  private extractParameters(params: any[]): Parameter[] {
    return params.map((param) => {
      if (t.isIdentifier(param)) {
        return {
          name: param.name,
          type: "any",
          optional: false,
        };
      } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
        return {
          name: param.left.name,
          type: "any",
          optional: true,
          defaultValue: this.extractDefaultValue(param.right),
        };
      } else if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
        return {
          name: param.argument.name,
          type: "array",
          optional: false,
        };
      }
      return {
        name: "unknown",
        type: "any",
        optional: false,
      };
    });
  }

  private extractDefaultValue(node: t.Expression): any {
    if (t.isStringLiteral(node)) return node.value;
    if (t.isNumericLiteral(node)) return node.value;
    if (t.isBooleanLiteral(node)) return node.value;
    if (t.isNullLiteral(node)) return null;
    return undefined;
  }

  private inferReturnType(node: any): string {
    // Basic type inference - can be extended
    if (node.async) return "Promise<any>";
    return "any";
  }

  private extractDependencies(node: any): string[] {
    const dependencies: string[] = [];

    traverse(
      node,
      {
        CallExpression: (path: NodePath<t.CallExpression>) => {
          if (t.isIdentifier(path.node.callee)) {
            dependencies.push(path.node.callee.name);
          } else if (
            t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.object)
          ) {
            dependencies.push(path.node.callee.object.name);
          }
        },
      },
      undefined,
      {}
    );

    return [...new Set(dependencies)];
  }

  private detectSideEffects(node: any, content: string): SideEffect[] {
    const sideEffects: SideEffect[] = [];

    traverse(
      node,
      {
        CallExpression: (path: NodePath<t.CallExpression>) => {
          const callExpr = path.node;

          // API calls
          if (this.isApiCall(callExpr)) {
            sideEffects.push({
              type: "api-call",
              description: "Makes HTTP request",
              mockable: true,
            });
          }

          // Database operations
          if (this.isDatabaseCall(callExpr)) {
            sideEffects.push({
              type: "database",
              description: "Database operation",
              mockable: true,
            });
          }

          // File system operations
          if (this.isFileSystemCall(callExpr)) {
            sideEffects.push({
              type: "filesystem",
              description: "File system operation",
              mockable: true,
            });
          }
        },

        AssignmentExpression: (path: NodePath<t.AssignmentExpression>) => {
          sideEffects.push({
            type: "state-mutation",
            description: "Mutates state",
            mockable: false,
          });
        },
      },
      undefined,
      {}
    );

    return sideEffects;
  }

  private isApiCall(node: t.CallExpression): boolean {
    if (t.isIdentifier(node.callee)) {
      return ["fetch", "axios", "request"].includes(node.callee.name);
    }
    if (
      t.isMemberExpression(node.callee) &&
      t.isIdentifier(node.callee.property)
    ) {
      return ["get", "post", "put", "delete", "patch"].includes(
        node.callee.property.name
      );
    }
    return false;
  }

  private isDatabaseCall(node: t.CallExpression): boolean {
    if (
      t.isMemberExpression(node.callee) &&
      t.isIdentifier(node.callee.property)
    ) {
      const method = node.callee.property.name;
      return [
        "find",
        "findOne",
        "save",
        "create",
        "update",
        "delete",
        "query",
      ].includes(method);
    }
    return false;
  }

  private isFileSystemCall(node: t.CallExpression): boolean {
    if (
      t.isMemberExpression(node.callee) &&
      t.isIdentifier(node.callee.object)
    ) {
      return node.callee.object.name === "fs";
    }
    if (t.isIdentifier(node.callee)) {
      return ["readFile", "writeFile", "readdir", "mkdir"].includes(
        node.callee.name
      );
    }
    return false;
  }

  private detectFunctionFramework(
    node: any,
    content: string
  ): FrameworkInfo | undefined {
    // React hooks detection
    const reactHooks = [
      "useState",
      "useEffect",
      "useContext",
      "useReducer",
      "useCallback",
      "useMemo",
    ];
    let hooks: string[] = [];

    traverse(
      node,
      {
        CallExpression: (path: NodePath<t.CallExpression>) => {
          if (
            t.isIdentifier(path.node.callee) &&
            reactHooks.includes(path.node.callee.name)
          ) {
            hooks.push(path.node.callee.name);
          }
        },
      },
      undefined,
      {}
    );

    if (hooks.length > 0) {
      return {
        type: "react",
        features: ["hooks"],
        hooks,
      };
    }

    return undefined;
  }

  private analyzeImport(node: t.ImportDeclaration): any {
    return {
      source: node.source.value,
      specifiers: node.specifiers.map((spec) => {
        if (t.isImportDefaultSpecifier(spec)) {
          return { name: spec.local.name, type: "default" };
        } else if (t.isImportSpecifier(spec)) {
          return { name: spec.local.name, type: "named" };
        } else if (t.isImportNamespaceSpecifier(spec)) {
          return { name: spec.local.name, type: "namespace" };
        }
        return { name: "unknown", type: "unknown" };
      }),
    };
  }

  private analyzeExport(node: t.ExportNamedDeclaration): any[] {
    const exports: any[] = [];

    if (node.declaration) {
      if (t.isFunctionDeclaration(node.declaration) && node.declaration.id) {
        exports.push({
          name: node.declaration.id.name,
          type: "function",
        });
      } else if (t.isVariableDeclaration(node.declaration)) {
        node.declaration.declarations.forEach((decl) => {
          if (t.isIdentifier(decl.id)) {
            exports.push({
              name: decl.id.name,
              type: "constant",
            });
          }
        });
      }
    }

    return exports;
  }

  private analyzeDefaultExport(node: t.ExportDefaultDeclaration): any {
    if (t.isFunctionDeclaration(node.declaration) && node.declaration.id) {
      return {
        name: node.declaration.id.name,
        type: "function",
        default: true,
      };
    }
    return {
      name: "default",
      type: "unknown",
      default: true,
    };
  }

  private calculateTestability(functions: FunctionInfo[]): TestabilityScore {
    if (functions.length === 0) {
      return {
        overall: 0,
        complexity: 0,
        dependencies: 0,
        sideEffects: 0,
        coverage: 0,
      };
    }

    const avgComplexity =
      functions.reduce((sum, f) => sum + f.complexity, 0) / functions.length;
    const avgDependencies =
      functions.reduce((sum, f) => sum + f.dependencies.length, 0) /
      functions.length;
    const avgSideEffects =
      functions.reduce((sum, f) => sum + f.sideEffects.length, 0) /
      functions.length;

    const complexityScore = Math.max(0, 100 - avgComplexity * 10);
    const dependencyScore = Math.max(0, 100 - avgDependencies * 5);
    const sideEffectScore = Math.max(0, 100 - avgSideEffects * 15);

    const overall = (complexityScore + dependencyScore + sideEffectScore) / 3;

    return {
      overall,
      complexity: complexityScore,
      dependencies: dependencyScore,
      sideEffects: sideEffectScore,
      coverage: 0, // Will be calculated after test generation
    };
  }

  private async findSourceFiles(): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of this.includePatterns) {
      const matches = await glob(pattern, {
        cwd: this.rootDir,
        absolute: true,
        ignore: this.excludePatterns,
      });
      files.push(...matches);
    }

    return [...new Set(files)];
  }
}
