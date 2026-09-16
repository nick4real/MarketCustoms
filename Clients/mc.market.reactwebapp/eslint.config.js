import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import boundaries from "eslint-plugin-boundaries";
import fsdImport from "eslint-plugin-fsd-import";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// Public API is the index.ts/index.tsx file in each layer.
const publicApi = "index.{ts,tsx}";

export default defineConfig([
  // Global Ignores
  globalIgnores(["dist", "build", "coverage", "node_modules", "*.min.js"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { boundaries, "fsd-import": fsdImport },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      // import { X } from "@/entities/listing" is resolved using tsconfig.app.json ("@/*": ["./src/*"]).
      // Without this, Boundaries would not know which layer @/… points at.
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.app.json",
        },
      },
      // dependency-nodes: ["import", "export"] means import and export are both considered dependencies.
      "boundaries/dependency-nodes": ["import", "export"],
      // legacy-templates: false means error messages use {{ }}, not the old ${ }.
      "boundaries/legacy-templates": false,
      // elements: […] defines the layers and their file patterns.
      // Without capture ["slice"], the whole folder is considered one element.
      // With capture ["slice"], each subfolder of the pattern is considered a separate element.
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "pages", pattern: "src/pages" },
        {
          type: "widgets",
          pattern: "src/widgets/*",
          capture: ["slice"],
        },
        {
          type: "features",
          pattern: "src/features/*",
          capture: ["slice"],
        },
        {
          type: "entities",
          pattern: "src/entities/*",
          capture: ["slice"],
        },
        { type: "shared", pattern: "src/shared" },
      ],
    },
    rules: {
      "fsd-import/fsd-relative-path": "error",
      "fsd-import/layer-imports": "error",
      "fsd-import/public-api-imports": "error",
      "boundaries/dependencies": [
        // FSD: Feature-Sliced Design
        "error",
        {
          default: "disallow",
          message:
            "FSD: {{from.element.types.[0]}} cannot import {{to.element.types.[0]}} ({{to.element.fileInternalPath}})",
          // Anything not listed in policies is forbidden:
          // higher layers cannot be imported from below,
          // same-layer slices cannot import each other
          policies: [
            // May import other shared files (@/shared/lib/parseJson is allowed)
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: "shared" } } },
            },
            // May import shared only. Entity slices cannot import each other
            {
              from: { element: { type: "entities" } },
              allow: { to: { element: { type: "shared" } } },
            },
            // May import shared (any file) and entities only via public API:
            // Allowed: from "@/entities/session"
            // Forbidden: from "@/entities/session/lib/mapAccount"
            {
              from: { element: { type: "features" } },
              allow: {
                to: [
                  { element: { type: "shared" } },
                  {
                    element: {
                      type: "entities",
                      fileInternalPath: publicApi,
                    },
                  },
                ],
              },
            },
            // Shared + entities public API + features public API. Widget-to-widget is forbidden
            {
              from: { element: { type: "widgets" } },
              allow: {
                to: [
                  { element: { type: "shared" } },
                  {
                    element: {
                      type: "entities",
                      fileInternalPath: publicApi,
                    },
                  },
                  {
                    element: {
                      type: "features",
                      fileInternalPath: publicApi,
                    },
                  },
                ],
              },
            },
            // Shared + public APIs of entities, features, and widgets. Page-to-page is forbidden
            {
              from: { element: { type: "pages" } },
              allow: {
                to: [
                  { element: { type: "shared" } },
                  {
                    element: {
                      type: "entities",
                      fileInternalPath: publicApi,
                    },
                  },
                  {
                    element: {
                      type: "features",
                      fileInternalPath: publicApi,
                    },
                  },
                  {
                    element: {
                      type: "widgets",
                      fileInternalPath: publicApi,
                    },
                  },
                ],
              },
            },
            // App layer can import anything.
            {
              from: { element: { type: "app" } },
              allow: {
                to: [
                  { element: { type: "app" } },
                  { element: { type: "pages" } },
                  { element: { type: "shared" } },
                  {
                    element: {
                      type: "widgets",
                      fileInternalPath: publicApi,
                    },
                  },
                  {
                    element: {
                      type: "features",
                      fileInternalPath: publicApi,
                    },
                  },
                  {
                    element: {
                      type: "entities",
                      fileInternalPath: publicApi,
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  },
]);
