# Locator Rules (CRITICAL)

Always prefer Playwright's recommended locators, in this priority:

1. `getByRole()` — best for buttons, links, headings, inputs by role/name
2. `getByLabel()` — for form fields associated with a label
3. `getByPlaceholder()` — for inputs with placeholders
4. `getByText()` — for unique visible text
5. `getByTestId()` — only when a stable `data-testid` attribute exists
6. `locator()` with stable attributes
7. CSS selectors (as a last resort)
8. XPath (only when nothing else works)

## Avoid

- Fragile CSS like `.btn:nth-child(2)`, `div > div > span`, `[class="generated-xyz"]`
- Absolute XPath when a Playwright locator exists

## Examples

- `page.getByRole('button', { name: 'Login' })`
- `page.getByLabel('Username')`
- `page.getByTestId('login-error')`

Never replace a good locator with XPath unnecessarily.
