import { config } from "@mg-mart/eslint-config/react-internal";

export default [
  ...config,
  {
    languageOptions: {
      globals: {
        __DEV__: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["babel.config.js", "metro.config.js"],
    languageOptions: {
      globals: {
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
      },
    },
  },
  {
    ignores: ["node_modules/**", ".expo/**", "dist/**", "ios/**", "android/**"],
  },
];
