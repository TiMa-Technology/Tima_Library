import js from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierPlugin from "eslint-plugin-prettier"
import importPlugin from "eslint-plugin-import"
import { fileURLToPath, URL } from "node:url"
import { includeIgnoreFile } from "@eslint/compat"

const gitignorePath = fileURLToPath(new URL("../.gitignore", import.meta.url))

export default [
  includeIgnoreFile(gitignorePath),

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    files: ["**/*.{js,ts,mjs,cjs}"],
    ignores: ["eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      semi: "off",
      "prefer-const": "error",
      "prettier/prettier": [
        "error",
        { semi: false, endOfLine: "auto", trailingComma: "es5" },
      ],
      // "import/named": "error", // 尚未支援 flat config
      "import/namespace": "error",
      "import/default": "error",
      "import/export": "error",
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/no-named-as-default": "error",
      "import/no-named-as-default-member": "error",
      "import/no-unresolved": [
        "error",
        { commonjs: true, caseSensitive: true },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },
]
