// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),            // React 지원
    svgr({              // .svg를 React 컴포넌트로 변환
      svgrOptions: {
        icon: false,    // SVG 원본 viewBox 유지
      },
    }),
  ],
  resolve: {
    alias: {
      // src를 @로 참조하도록 (선택)
      '@': '/src',
    },
  },
  server: { open: true },
})
