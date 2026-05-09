import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function resolveProxyTarget(env) {
  const configured =
    env.VITE_API_PROXY_TARGET ||
    (env.VITE_API_BASE_URL?.startsWith("http") ? env.VITE_API_BASE_URL : "");

  return (configured || "http://localhost:8081").replace(/\/api\/?$/, "");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: resolveProxyTarget(env),
          changeOrigin: true,
        },
      },
    },
  };
});
