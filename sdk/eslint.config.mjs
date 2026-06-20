import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

// Catches both snake_case (`auth_v2`, `auth_new`) and PascalCase (`AuthV2`, `AuthNew`) drift.
// Pattern source: constraints.yaml -> code_canonicality.forbidden_suffixes.patterns.
const forbiddenVersionSuffix =
  "(_v[0-9]+|_new|_old|_backup|_temp|_copy|_final|_real|_improved|_refactored|_fixed|_legacy|_deprecated|V[0-9]+|New|Old|Backup|Temp|Copy|Final|Real|Improved|Refactored|Fixed|Legacy|Deprecated)$";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "reports/**", ".run/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,js}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      // Size discipline — L4: 700 lines, complexity 10.
      "max-lines": [
        "error",
        { max: 700, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["error", 10],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "forbid",
          custom: { regex: forbiddenVersionSuffix, match: false },
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
          custom: { regex: forbiddenVersionSuffix, match: false },
        },
        {
          selector: "objectLiteralProperty",
          format: null,
          custom: { regex: forbiddenVersionSuffix, match: false },
        },
      ],
      "import/no-cycle": ["error", { maxDepth: 1, ignoreExternal: true }],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./sdk/src/domain",
              from: "./sdk/src/infrastructure",
              message:
                "Domain layer must not import from infrastructure.",
            },
            {
              target: "./sdk/src/domain",
              from: "./sdk/src/application",
              message:
                "Domain layer must not import from application.",
            },
            {
              target: "./sdk/src/application",
              from: "./sdk/src/infrastructure",
              message:
                "Application layer must not import from infrastructure.",
            },
          ],
        },
      ],
      "no-console": "error",
      "no-debugger": "error",
    },
  },
);
