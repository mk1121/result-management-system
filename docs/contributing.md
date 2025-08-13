# Contributing Guide

Thank you for considering contributing to the Result Management System (RMS)!

## Quick Start
- Fork and clone the repo
- Setup:
  - Server: `cd server && npm ci`
  - Client: `cd client && npm ci`
- Run locally:
  - Server: `npm run dev` (port 4000)
  - Client: `npm run dev` (port 5173)
- With Docker: `docker compose up -d --build`

## Branching Strategy
- Create branches from `main`:
  - `feat/<short-feature-name>`
  - `fix/<short-bug-name>`
  - `docs/<short-docs-topic>`
  - `chore/<task>`

## Commit Messages (Conventional Commits)
- Format: `type(scope): summary`
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `build`, `ci`
- Examples:
  - `feat(server): add assessment update/delete endpoints`
  - `fix(client): guard createRoot in tests`
  - `docs: add deployment guide`

## Code Style
- ESLint + Prettier are enforced
- Run before pushing:
  - Server: `npm --prefix server run lint && npm --prefix server run format`
  - Client: `npm --prefix client run lint && npm --prefix client run format`
- Follow naming and structure from existing code; prefer clear, descriptive names

## Testing
- Server (Jest): `npm --prefix server test`
- Client (Vitest): `npm --prefix client test`
- Aim for high coverage (≈90% overall). Add/adjust tests when changing behavior
- Integration tests use mongodb-memory-server

## Pre-commit Hooks
- Husky runs lint and client tests automatically
- Keep commits small; fix issues before commit to avoid hook failures

## PR Guidelines
- Keep PRs focused; include a clear description and rationale
- Checklist:
  - [ ] Lint passes (server/client)
  - [ ] Tests pass (server/client)
  - [ ] Updated docs if user-facing behavior changed
  - [ ] Screenshots/GIFs for UI changes (optional)
- Link related issues; request review when ready

## Environment & Secrets
- Do not commit secrets. Use `.env` locally, CI secrets in GitHub, and hosting provider secrets
- Server CORS: set `CLIENT_ORIGINS` appropriately for deployed environments
- Client builds: set `VITE_API_URL` for production

## Docs & Diagrams
- Documentation lives in `docs/`
- Update diagrams in `docs/diagrams/*.mmd` and regenerate assets as needed

## Questions
- Open a Discussion or Issue with context, logs, and repro steps
