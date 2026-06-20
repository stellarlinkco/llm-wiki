import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "sdk/src/index.ts",
    "sdk/src/**/*.{test,spec}.{ts,js}",
    "sdk/test/**/*.{test,spec}.{ts,js}",
    "sdk/examples/**/*.mjs",
  ],
  project: ["sdk/src/**/*.ts", "sdk/test/**/*.js", "sdk/examples/**/*.mjs"],
  ignore: ["dist/**", "node_modules/**", "coverage/**", "reports/**"],
  ignoreDependencies: ["@types/*", "eslint-*", "prettier", "typescript"],
};

export default config;
