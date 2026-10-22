import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { localEditor } from "./scripts/local-editor.mjs";
export default defineConfig({
  site: "https://mostpomocy.pl",
  output: "static",
  trailingSlash: "always",
  integrations: [react()],
  vite: {
    server: { watch: { usePolling: true, interval: 400 } },
    optimizeDeps: {
      entries: [],
      noDiscovery: true,
      include: [
        "react",
        "react-dom/client",
        "react-admin",
        "ra-input-rich-text",
        "react-hook-form",
        "ra-i18n-polyglot",
        "ra-language-english",
        "react-router-dom",
        "@mui/material",
        "@mui/icons-material/Article",
        "@mui/icons-material/Category",
        "@mui/icons-material/Place",
        "@mui/icons-material/Image",
        "@mui/icons-material/Settings",
        "@mui/icons-material/QueryStats",
      ],
    },
    plugins: [localEditor()],
  },
  devToolbar: { enabled: false },
});
