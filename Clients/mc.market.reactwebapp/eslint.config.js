import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import boundaries from "eslint-plugin-boundaries";
import query from "@tanstack/eslint-plugin-query";
import fsdImport from "eslint-plugin-fsd-import";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// Public API is the index.ts/index.tsx file in each slice (or shared segment).
const publicApi = "index.{ts,tsx}";

// Other layers see a shared segment (ui, lib, api, config) only through its root index:
// Allowed: from "@/shared/ui"
// Forbidden: from "@/shared/ui/Button"
const sharedPublicApi = {
  element: { type: "shared", fileInternalPath: publicApi },
};

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
      query.configs["flat/recommended"],
    ],
    plugins: { boundaries, query, "fsd-import": fsdImport },
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
      // With capture ["slice"] each subfolder of the pattern is a separate element,
      // so two slices on the same layer are different elements (page-to-page and
      // entity-to-entity imports are denied). Shared is split into segments
      // (ui, lib, api, config) the same way. app has no slices: it is one element.
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "pages", pattern: "src/pages/*", capture: ["slice"] },
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
        { type: "shared", pattern: "src/shared/*", capture: ["segment"] },
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
          // Also evaluate imports that stay inside one element, so the
          // self-import policy below can see them.
          checkInternals: true,
          message:
            "FSD: {{from.element.types.[0]}} cannot import {{to.element.types.[0]}} ({{to.element.fileInternalPath}})",
          // Anything not listed in policies is forbidden:
          // higher layers cannot be imported from below,
          // same-layer slices cannot import each other
          policies: [
            // Inside one element (slice or shared segment), relative imports
            // are allowed; importing it through its own `@/` alias is not.
            // These two must stay first: the last matching policy wins.
            { allow: { dependency: { relationship: { to: "internal" } } } },
            {
              disallow: {
                dependency: {
                  relationship: { to: "internal" },
                  source: "@/**",
                },
              },
              message:
                "FSD: use a relative import inside {{from.element.types.[0]}} instead of its own @/ alias",
            },
            // May import other shared files, including across segments
            // (@/shared/lib/parsePositiveInteger is allowed)
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: "shared" } } },
            },
            // May import shared segment roots only. Entity slices cannot import each other
            {
              from: { element: { type: "entities" } },
              allow: { to: sharedPublicApi },
            },
            // May import shared segment roots and entities only via public API:
            // Allowed: from "@/entities/session"
            // Forbidden: from "@/entities/session/lib/mapAccount"
            {
              from: { element: { type: "features" } },
              allow: {
                to: [
                  sharedPublicApi,
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
                  sharedPublicApi,
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
                  sharedPublicApi,
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
            // App layer: itself, shared segment roots, and public APIs of every other layer.
            {
              from: { element: { type: "app" } },
              allow: {
                to: [
                  { element: { type: "app" } },
                  sharedPublicApi,
                  {
                    element: {
                      type: "pages",
                      fileInternalPath: publicApi,
                    },
                  },
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
