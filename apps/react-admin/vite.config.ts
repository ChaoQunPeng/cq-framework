import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig({
  // Tailwind CSS v4 通过 Vite 插件扫描源码并生成实际使用的工具类。
  plugins: [tailwindcss(), react(), codeInspectorPlugin({ bundler: 'vite' })],
})
