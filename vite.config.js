import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    {
      name: 'copy-to-root-dist',
      closeBundle() {
        try {
          const srcDir = path.resolve('frontend/dist');
          const destDir = path.resolve('dist');
          if (fs.existsSync(srcDir)) {
            fs.cpSync(srcDir, destDir, { recursive: true, force: true });
          }
        } catch (e) {
          console.warn('Failed to mirror dist:', e);
        }
      },
    },
  ],
});