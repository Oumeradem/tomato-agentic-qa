---
name: locator-strategy
description: Locator priority and rules — use before writing any locator.
---

# Locator Strategy Skill

## Purpose

Choose robust, maintainable locators that survive UI changes.

## When to Use

- Writing or fixing any locator.

## Priority

1. `getByRole()` — buttons, links, headings, inputs by role/name
2. `getByLabel()` — form fields with labels
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()` — stable `data-testid` attributes
6. `locator()` with stable attributes
7. CSS (last resort)
8. XPath (only when nothing else works)

## Examples

- `page.getByRole('button', { name: 'Login' })`
- `page.getByLabel('Username')`
- `page.getByTestId('login-error')`

## Anti-patterns

- `.btn:nth-child(2)` — positional CSS
- `div > div > span` — deep structural
- `[class="generated-abc"]` — generated classes
- Absolute XPath when a Playwright locator exists

## Validation Checklist

- [ ] Highest-priority locator used
- [ ] No XPath unless necessary
- [ ] No fragile CSS
