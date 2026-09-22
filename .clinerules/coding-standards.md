# Coding Standards

## TypeScript

- Use **strict** TypeScript (see `tsconfig.json`).
- Avoid `any`. Prefer interfaces and type aliases with meaningful names.
- Use meaningful variable names: `loginPage`, `submitButton` — never `x`, `y`, `temp`.
- Use `async`/`await` consistently. Never mix raw promise chains where await is clearer.
- Use `const` by default; use `let` only when reassignment is required.

## Style

- Follow Prettier configuration (`prettier.config.js`).
- Follow ESLint configuration (`eslint.config.js`).
- Run `npm run lint`, `npm run format:check`, and `npm run typecheck` before finishing changes.

## Error Handling

- Handle errors explicitly. Do not swallow exceptions silently.
- Use Playwright's automatic waiting instead of arbitrary sleeps.
- Do not disable assertions or add `waitForTimeout` to force tests to pass.
