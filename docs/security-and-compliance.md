# Security and Compliance

- Use strong `JWT_SECRET` and rotate periodically
- Limit CORS via `CLIENT_ORIGIN(S)` to trusted origins only
- Validate inputs server-side (present in routes)
- Hash passwords with bcryptjs
- Store secrets in CI/hosting provider secret stores (not in repo)
- Keep dependencies updated and image base versions current
