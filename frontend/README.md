# DinControl — Frontend

React + TypeScript (Vite) single-page app for DinControl. Talks to the
Express API in `../src/server.js` (see the root `README.md` for the full
project).

## Development

```bash
npm install
npm run dev
```

The dev server proxies `/users`, `/login`, `/logout`, `/me`, `/lists`,
`/list-items`, `/notes`, `/transactions` and `/forgot-password/*` to
`http://localhost:3000`, so run the Express server (`npm start` from the
repo root) alongside it.

## Build

```bash
npm run build
```

Outputs to `dist/`, which the Express server serves in production
(with a SPA fallback to `index.html` for client-side routes).
