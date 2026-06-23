import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Set VITE_BASE_PATH=/repo-name/ when deploying to GitHub Pages subpaths.
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('monaco-editor')) return 'vendor-monaco';
          if (id.includes('jszip')) return 'vendor-jszip';
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
          if (id.includes('lz-string') || id.includes('file-saver')) return 'vendor-utils';
          return 'vendor';
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
