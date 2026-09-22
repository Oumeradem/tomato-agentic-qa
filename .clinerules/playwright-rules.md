# Playwright Rules

- Use Playwright's built-in capabilities and automatic waiting.
- Prefer role/accessibility-based interactions:
  - `page.getByRole('button', { name: 'Submit' }).click()`
  - `expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()`
- **Never** use arbitrary `page.waitForTimeout(...)` without a documented technical reason.
- Use the custom World (`this.page`, `this.context`) inside step definitions and hooks — never instantiate your own browser in steps.
- A fresh `BrowserContext` is created per scenario in `src/hooks/hooks.ts` for isolation. Do not share state between scenarios.
- Failure artifacts (screenshot, trace, console) are captured automatically on failure in `src/utils/artifacts.ts`.
- Use `config.*` for URLs, credentials, timeouts, and browser settings. Never hardcode them.
- Ensure locators survive reasonable UI changes (see `locator-rules.md`).
