import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    fs: {
      strict: false,
    },
    // Vite 8 feature: optionally forward console logs to terminal
    forwardConsole: true,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      react: path.resolve("./node_modules/react"),
      "@demo": path.resolve(__dirname, "./src"),
      "@": path.resolve("../packages/lattice/src"),
      lattice: path.resolve("../packages/lattice/src/index.tsx"),
    },
  },
  // Note: define: {} is standard, but Vite 8 handles env vars more robustly
  define: {},
  build: {
    // In Vite 8, lightningcss is the default for high-performance minification
    // If you still want Terser, ensure 'terser' is installed in your devDependencies
    minify: "terser",
    manifest: true,
    sourcemap: true,
    // Modernized build target; Vite 8 defaults to newer baselines
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/html2canvas")) return "html2canvas";
          if (id.includes("node_modules/lodash")) return "lodash";
          if (id.includes("node_modules/mjml-browser")) return "mjml-browser";
          if (id.includes("lattice")) return "lattice";
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: "dashes",
    },
    preprocessorOptions: {
      scss: {},
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    react(),
    // Replaced vite-plugin-html with native transform hook
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(
          "</head>",
          `<meta name="updated-time" content="${new Date().toUTCString()}" />\n</head>`,
        );
      },
    },
  ],
});
