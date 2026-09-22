---
name: page-object-model
description: Page Object Model conventions for this framework — use before creating or extending pages.
---

# Page Object Model Skill

## Purpose

Encapsulate locators and page-specific actions in reusable Page Objects that extend `BasePage`.

## When to Use

- Creating a new page/component class or adding actions to an existing one.

## Rules

- Each page represents a single application page or component.
- Extend `BasePage` (provides `goto`, `gotoPath`, `getTitle`, click/fill helpers).
- Encapsulate locators as private readonly fields; expose business actions.
- Keep pages free of test logic and assertions where possible.
- Prefer composition (small components like `Header`) over monolithic classes.
- Reuse existing Page Objects — search `src/pages` first.

## Example

```ts
export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.getByLabel('Username');
  private readonly loginButton = this.page.getByRole('button', { name: 'Login' });

  async login(username: string, password: string): Promise<DashboardPage> {
    await this.fill(this.usernameInput, username);
    await this.click(this.loginButton);
    return new DashboardPage(this.page);
  }
}
```

## Anti-patterns

- 1,000-line page classes
- Assertions embedded deep in a page
- Duplicated locators across pages

## Validation Checklist

- [ ] Extends BasePage
- [ ] Locators encapsulated
- [ ] Business actions, not raw DOM
- [ ] No duplicate page classes
