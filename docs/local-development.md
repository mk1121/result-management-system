# Local Development

## Prerequisites
- Node.js 20+
- Docker (optional)

## Run without Docker
- Terminal A
  - cd server
  - npm ci
  - npm run dev
- Terminal B
  - cd client
  - npm ci
  - npm run dev

Notes:
- Dev server proxies `/api` to `http://localhost:4000` unless `VITE_API_URL` is set.
- Seed sample data: `cd server && npm run seed`.

## Run with Docker Compose
- From repo root:
  - docker compose up -d --build
- Services
  - MongoDB: 27017
  - Server: http://localhost:4000
  - Client: http://localhost:5173
