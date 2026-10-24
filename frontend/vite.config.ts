import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { ProxyOptions } from 'vite'

const API_TARGET = 'http://localhost:3000'

// `/login` is both a page route (client-side, GET navigation) and a POST
// API route on the Express backend, so it needs special handling: only
// bypass the proxy (let Vite serve the SPA) for HTML navigation requests.
const loginProxy: ProxyOptions = {
  target: API_TARGET,
  changeOrigin: true,
  bypass(req) {
    const aceita = req.headers.accept || ''

    if (req.method === 'GET' && aceita.includes('text/html')) {
      return req.url
    }

    return undefined
  },
}

const SIMPLE_API_ROUTES = [
  '/users',
  '/logout',
  '/me',
  '/transactions',
  '/forgot-password',
  '/lists',
  '/list-items',
  '/notes',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': loginProxy,
      ...Object.fromEntries(
        SIMPLE_API_ROUTES.map((route) => [
          route,
          { target: API_TARGET, changeOrigin: true },
        ]),
      ),
    },
  },
  build: {
    outDir: 'dist',
  },
})
