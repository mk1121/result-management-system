# Deployment

## Docker Compose (self-hosted)
- Configure `docker-compose.yml` if needed
- Bring up: `docker compose up -d --build`
- Update: `docker compose pull && docker compose up -d`

## Docker images (Docker Hub)
- Images:
  - Server: `<dockerhub-user>/rms-server`
  - Client: `<dockerhub-user>/rms-client`
- Tags: commit SHA and `latest` (or tag ref)

## GitHub Actions (build and publish)
- Workflow: `.github/workflows/docker-publish.yml`
- Requirements:
  - Secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
  - Server secrets: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (or `CLIENT_ORIGINS`)
  - Client: `VITE_API_URL` (secret or repo variable)

## Render (or similar PaaS) — Server
- Set env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN(S)`
- Expose port 4000
- Ensure CORS origins include your client domain (e.g., https://your-client-domain)

## Static hosting — Client
- Build with API URL: `docker build ./client --build-arg VITE_API_URL=https://api.example.com/api`
- Serve built `dist/` via Nginx (Dockerfile included)
