---
name: playwright
description: Playwright best practices for this framework — use before writing any browser automation code.
---

# Playwright Skill

## Purpose

Write reliable Playwright automation using built-in waiting, role-based locators, and the framework's World/hooks.

## When to Use

- Writing any new browser interaction, Page Object, or step definition.
- Debugging flaky selectors or timing issues.

## Rules

- Always use the custom World (`this.page`, `this.context`) inside steps/hooks. Never create your own browser in a step.
- Use Playwright's automatic waiting instead of `waitForTimeout`.
- Use `expect(...).toBeVisible()` / `.toHaveText()` etc. with auto-wait.
- A fresh BrowserContext per scenario guarantees isolation (handled by hooks).
- Use `config.*` for URLs, timeouts, and browser settings.

## Examples

```ts
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Username').fill('demo');
```

## Anti-patterns

- `page.waitForTimeout(3000)` — arbitrary waits
- `page.locator('#submit')` when a role locator exists
- Instantiating `chromium.launch()` inside a step definition

## Validation Checklist

- [ ] Uses World page, not a self-launched browser
- [ ] No arbitrary waits
- [ ] Uses auto-waiting assertions
- [ ] No hardcoded URLs/credentials
