import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import pkg from "./package.json";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {},
  build: {
    emptyOutDir: false,
    minify: true,
    cssMinify: "esbuild",
    manifest: false,
    sourcemap: true,
    target: "esnext",
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "lattice",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      plugins: [],
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        "react/jsx-runtime",
        "react-dom/server",
      ].map((dep) => new RegExp(`^${dep}(/.*)?`)),
      output: {},
    },
    outDir: "lib",
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts"],
  },
  css: {
    modules: {
      localsConvention: "dashes",
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api", "import", "global-builtin"],
      },
    },
  },
});
