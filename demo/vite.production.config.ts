import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/Lattice/",
  resolve: {
    // Vite 8 built-in support for tsconfig path resolution
    tsconfigPaths: true,
    alias: {
      "@demo": path.resolve(__dirname, "./src"),
      react: path.resolve("./node_modules/react"),
      "react-final-form": path.resolve(
        __dirname,
        "./node_modules/react-final-form",
      ),
      lattice: path.resolve("../packages/lattice/src/index.tsx"),
    },
  },
  build: {
    minify: "terser", // Vite 8 uses lightningcss by default, but terser is safer for complex monorepos
    manifest: true,
    sourcemap: false,
    target: "esnext", // Modernized build target for Vite 8
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/lodash")) return "lodash";
          if (id.includes("node_modules/mjml-browser")) return "mjml-browser";
          if (id.includes("lattice")) return "lattice";
        },
        chunkFileNames(info) {
          const legacyChunks = ["mjml-browser"];
          if (legacyChunks.some((name) => info.name?.includes(name))) {
            return "[name].js";
          }
          return "[name]-[hash].js";
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
