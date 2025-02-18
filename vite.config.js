import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './', // Ensure this points to the correct folder if needed
  build: {
    outDir: 'dist', // Vercel will look for this folder
  },
});
