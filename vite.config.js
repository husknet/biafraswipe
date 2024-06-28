import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Ensure the output directory is named "build"
    rollupOptions: {
      input: 'public/index.html' // Ensure the correct path to index.html
    }
  },
  server: {
    open: true,
  },
});
