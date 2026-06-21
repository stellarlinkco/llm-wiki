import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "sdk/src/index.ts",
    "sdk/src/**/*.{test,spec}.{ts,js}",
    "sdk/test/**/*.{test,spec}.{ts,js}",
    "sdk/examples/**/*.mjs",
    "commitlint.config.js",
    ".husky/pre-commit",
    "sdk/eslint.config.mjs",
  ],
  project: ["sdk/src/**/*.ts", "sdk/test/**/*.js", "sdk/examples/**/*.mjs"],
  ignore: ["dist/**", "node_modules/**", "coverage/**", "reports/**"],
  ignoreDependencies: [
    "@types/*",
    "eslint-*",
    "prettier",
    "typescript",
    "@commitlint/cli",
    "@commitlint/config-conventional",
    "husky",
    "lint-staged",
    "@eslint/js",
  ],
};

export default config;
