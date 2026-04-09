import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')


  return {
    plugins: [react()],
    server: {
      port: parseInt(env.FRONTEND_PORT) || 4009,
      allowedHosts: (env.ALLOWED_HOSTS || '').split(',').map(h => h.trim()).filter(Boolean),
      proxy: {
        '/api': `http://localhost:${env.BACKEND_PORT || 4008}`,
        '/ws': {
          target: `ws://localhost:${env.BACKEND_PORT || 4008}`,
          ws: true
        }
      }
    },
    build: {
      outDir: 'dist'
    }
  }
})