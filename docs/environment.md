# Environment Variables

## Server
- MONGO_URI: Mongo connection string (e.g., mongodb://mongo:27017/rms)
- JWT_SECRET: Secret for signing JWTs
- CLIENT_ORIGIN: Single allowed CORS origin (e.g., http://localhost:5173)
- CLIENT_ORIGINS: Comma-separated list of allowed CORS origins (overrides CLIENT_ORIGIN)

Where to set:
- Local: set in a `.env` file or shell before `npm run dev/start`
- Docker Compose: `docker-compose.yml` env section
- Docker build (CI): passed as build args in `.github/workflows/docker-publish.yml`
- Render/Hosting: configure as environment variables in the service dashboard

## Client (Vite)
- VITE_API_URL: Base API URL including `/api` (e.g., http://localhost:4000/api)

Behavior:
- If `VITE_API_URL` is unset in dev, Vite dev server proxies `/api` to `http://localhost:4000`.
- In production builds, set `VITE_API_URL` at build time (Dockerfile supports `ARG VITE_API_URL`).
