import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite' // 1. Import ตัวนี้เข้ามา

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // 2. เพิ่ม tailwindcss เข้าไปใน plugins,
});
