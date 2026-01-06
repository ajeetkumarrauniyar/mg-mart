import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production for security
    minify: 'terser',
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       vendor: ['react', 'react-dom'],
    //       axios: ['axios']
    //     }
    //   }
    // }
  },

  // Preview configuration for local testing
  preview: {
    port: 4173,
    host: true
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true
  }
})
