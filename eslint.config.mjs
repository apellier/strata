import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Start with all of ESLint's core rules
  "eslint:all",

  // Add the strictest recommended configurations
  ...compat.extends(
    "plugin:@typescript-eslint/all",
    "plugin:react/all",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/strict",
    "next/core-web-vitals",
  ),
  
  // Your custom rules or overrides can go here
  {
    rules: {
      // Example: disable a rule that's too noisy for your project
      "no-console": "off",
      "react/jsx-filename-extension": [1, { "extensions": [".tsx"] }]
    }
  }
];

export default eslintConfig;