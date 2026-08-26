/*
 * ESLint flat config.
 *
 * This deliberately does NOT use `eslint-config-next` as a whole. That config
 * pulls in typescript-eslint, which hard-throws on TypeScript 7 (it gates on
 * `versionMajor >= 7` at import time and only supports the TS 6 API — see
 * typescript-eslint#10940). Because `typescript` is a *peerOptional* of
 * eslint-config-next, npm always resolves it to the root copy, so the
 * documented "run TS 6 side by side" workaround cannot be expressed here.
 *
 * Instead we assemble the same plugin set eslint-config-next assembles, and
 * parse with Next's own Babel-based parser — which understands TypeScript
 * syntax without touching the TypeScript compiler API, and so is unaffected by
 * the TS 7 gate.
 *
 * What this costs: the type-aware lint rules. Type correctness is still fully
 * covered by `npm run typecheck` (tsc 7) and by the type check `next build`
 * runs. Drop this file and go back to `eslint-config-next` once
 * typescript-eslint ships TS 7 support.
 */
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import nextParser from "eslint-config-next/parser";
import prettierFlat from "eslint-config-prettier/flat";
import globals from "globals";

const config = [
  {
    ignores: [".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"],
  },

  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],

    languageOptions: {
      parser: nextParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        allowImportExportEverywhere: true,
        babelOptions: {
          presets: ["next/babel"],
          caller: { supportsTopLevelAwait: true },
        },
      },
      globals: { ...globals.browser, ...globals.node },
    },

    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },

    settings: { react: { version: "detect" } },

    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactHooksPlugin.configs["recommended-latest"].rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,

      // The App Router compiles with the automatic JSX runtime, so React
      // doesn't need to be in scope, and types replace prop-types.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },

  // Must stay last: switches off stylistic rules that would fight Prettier.
  prettierFlat,
];

export default config;
