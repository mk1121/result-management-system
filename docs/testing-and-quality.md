# Testing and Quality

## Backend (server)
- Test runner: Jest
- HTTP assertions: Supertest
- In-memory DB: mongodb-memory-server
- Commands:
  - `cd server && npm test`
  - Coverage configured in `server/jest.config.js`

## Frontend (client)
- Test runner: Vitest
- RTL: @testing-library/react
- Commands:
  - `cd client && npm test`

## Linting & Formatting
- ESLint flat config in `server/eslint.config.mjs` and `client/eslint.config.js`
- Prettier config `.prettierrc.json`

## Git Hooks
- Husky pre-commit runs lint and client tests by default
- Set `RUN_SERVER_TESTS=1` to also run server tests in the hook
