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
    // Maps were two thirds of the published package, and consumers debug their own bundle.
    sourcemap: false,
    target: "esnext",
    lib: {
      // The Handlebars renderer is its own entry, so the main entry never imports the optional peer.
      entry: {
        index: path.resolve(__dirname, "src/index.tsx"),
        handlebars: path.resolve(__dirname, "src/handlebars.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
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
