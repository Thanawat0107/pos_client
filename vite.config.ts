import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base: "/cs66/s07/cnmswep/",
  // build: {
  //   outDir: "../cnms_api/cnms_api/wwwroot",
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         vendor: ["react", "react-dom"],
  //         mui: ["@mui/material", "@mui/icons-material"],
  //         redux: ["@reduxjs/toolkit", "react-redux"],
  //       },
  //     },
  //   },
  // },
});
