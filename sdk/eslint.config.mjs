import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

const forbiddenVersionSuffix =
  "(_v[0-9]+|_new|_old|_backup|_temp|_copy|_final|_real|_improved|_refactored|_fixed|_legacy|_deprecated|V[0-9]+|New|Old|Backup|Temp|Copy|Final|Real|Improved|Refactored|Fixed|Legacy|Deprecated)$";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "coverage/**", "reports/**", ".run/**"] },
  js.configs.recommended,
  // Type-aware rules: src/ only
  ...tseslint.configs.strictTypeChecked.map((c) => ({ ...c, files: ["src/**/*.ts"] })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({ ...c, files: ["src/**/*.ts"] })),
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.node },
    },
    plugins: { import: importPlugin },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "max-lines": ["error", { max: 700, skipBlankLines: true, skipComments: true }],
      complexity: ["error", 10],
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "variableLike", format: ["camelCase", "UPPER_CASE"], filter: { regex: forbiddenVersionSuffix, match: false } },
        { selector: "function", format: ["camelCase"], filter: { regex: forbiddenVersionSuffix, match: false } },
        { selector: "typeLike", format: ["PascalCase"], filter: { regex: forbiddenVersionSuffix, match: false } },
        { selector: "parameter", modifiers: ["unused"], format: null, leadingUnderscore: "allow" },
      ],
      "import/no-cycle": ["error", { maxDepth: 1, ignoreExternal: true }],
      "import/no-restricted-paths": [
        "error",
        { zones: [
          { target: "./src/domain", from: "./src/application", message: "Domain must not import from application layer." },
          { target: "./src/domain", from: "./src/infrastructure", message: "Domain must not import from infrastructure layer." },
          { target: "./src/application", from: "./src/infrastructure/providers", message: "Application must not import provider SDKs." },
        ]},
      ],
      "no-console": "error",
      "no-debugger": "error",
    },
  },
  // Examples: Node globals, no type-aware rules
  {
    files: ["examples/**/*.mjs"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "no-console": "off" },
  },
  // Test files: no type-aware rules
  {
    files: ["sdk/test/**/*.js", "test/**/*.js"],
    languageOptions: { globals: { process: "readonly", console: "readonly", ...globals.node } },
    rules: { "no-undef": "off", "no-unused-vars": "off", "no-console": "off", "max-lines": "off", complexity: "off" },
  },
);
