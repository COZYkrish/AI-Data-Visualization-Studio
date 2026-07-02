import baseConfig from "./packages/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/logs/**",
      "**/pgdata/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.cjs",
      "**/vite.config.ts",
    ],
  },
];
