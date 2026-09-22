# Environment Rules

- Support `dev`, `qa`, `stage`, `prod`.
- Select the environment with `ENV=qa npm test`.
- All environment-specific values live in `src/config/environments/*.ts` and are merged in `src/config/config.ts`.
- **Never hardcode URLs** in pages or steps. Use `config.baseUrl`.
- The selected environment is `config.env`; the base URL is `config.baseUrl`.
- Credentials come from `.env` via `config.credentials.*` — never inline them.
- Default `.env` targets the local demo app (`http://localhost:3000`). Replace `baseUrl` in the environment config with your real environment.
