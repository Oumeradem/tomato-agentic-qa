# Architecture Rules

## Framework Structure

- This project is a **Playwright + TypeScript + Cucumber BDD** automation framework.
- The primary test runner is **Cucumber** (`@cucumber/cucumber`). Playwright drives the browser from the custom World and hooks.
- Keep the canonical structure:

```
src/
  pages/      Page Object Model (one file per page/component)
  steps/      Cucumber step definitions (thin)
  hooks/      Cucumber hooks (browser lifecycle)
  support/    World + browser lifecycle helpers
  config/     Central config + per-environment config
  utils/      Logger, reporter, artifacts, helpers
  data/       Static test data
  fixtures/   Dynamic data factories
  types/      Shared TypeScript types
features/     Gherkin feature files
scripts/      Utility scripts (demo server, etc.)
```

## Dependency Rules

- Use only libraries already present in `package.json`. Do **not** introduce new libraries unless there is a strong reason, and get approval first.
- Never add `any` to bypass typing without a documented justification.

## Composition over Monoliths

- Prefer small, focused Page Objects and components over giant 1,000-line classes.
- Do not create duplicated Page Objects or utilities. **Search the repository before creating anything new.**
