# Troubleshooting

## CORS errors
- Ensure server `CLIENT_ORIGIN(S)` includes the frontend origin (exact scheme+host+port)
- For multi-origins, set `CLIENT_ORIGINS=a,b,c`

## Mongo connection refused
- Use Docker Compose for local Mongo, or verify MONGO_URI correctness

## mongodb-memory-server lock/download errors in CI/local
- Avoid running server tests in pre-commit, or clear `~/.cache/mongodb-binaries`

## Vitest duplicated `--run`
- Run `npm test` without passing `-- --run` if the script already includes `--run`

## PDF or file downloads failing with 401
- Must fetch with Authorization header; direct navigation won’t send JWT
