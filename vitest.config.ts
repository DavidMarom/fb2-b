import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    server: {
      deps: {
        // Prevent vitest from trying to resolve CJS/ESM hybrid next modules
        inline: ["next-auth"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // next-auth imports "next/server" (bare), map to the .js extension variant
      "next/server": path.resolve(__dirname, "node_modules/next/server.js"),
      "next/headers": path.resolve(__dirname, "node_modules/next/headers.js"),
      "next/navigation": path.resolve(__dirname, "node_modules/next/navigation.js"),
      "next/cache": path.resolve(__dirname, "node_modules/next/cache.js"),
    },
  },
});
