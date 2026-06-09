import { defineConfig, loadEnv } from "vite";
import plugin from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gatewayTarget =
    env.MARKETCUSTOMSGATEWAY_HTTP ||
    env.services__marketCustomsGateway__http__0 ||
    "http://localhost:5282";

  return {
    plugins: [plugin(), tailwindcss()],
    server: {
      port: Number(env.PORT) || 61328,
      proxy: {
        "/api": {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
