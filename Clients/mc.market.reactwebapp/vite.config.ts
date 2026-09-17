/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import plugin from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// VITE_AUTH0_DOMAIN
// VITE_AUTH0_CLIENT_ID
// VITE_AUTH0_AUDIENCE

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gatewayUrl =
    env.MARKETCUSTOMSGATEWAY_HTTPS ||
    env.services__marketCustomsGateway__https__0 ||
    env.services__marketCustomsGateway__http__0 ||
    env.MARKETCUSTOMSGATEWAY_HTTP ||
    "http://localhost:5000";

  return {
    plugins: [plugin(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "src"),
      },
    },
    test: {
      include: ["src/**/__tests__/**/*.test.ts"],
      environment: "node",
    },
    server: {
      port: Number(env.PORT) || 55577,
      proxy: {
        "/api": {
          target: gatewayUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
