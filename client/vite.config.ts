import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/static/app/api_input_connect/client/', // ensure matches Splunk static URL
  plugins: [react()],
  build: {
    // debugging settings
    sourcemap: true,
    minify: false,
    // cssCodeSplit: false,
    outDir: path.resolve(__dirname, '../api_input_connect/appserver/static/client'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `index.js`,  // fixed filename, no hash
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  },
  server: {
    allowedHosts: ['5173-joe88306-test-t1zygb6m8du.ws.app.gitpod.gss.gov.uk']
  }
});
