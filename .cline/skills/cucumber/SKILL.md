---
name: cucumber
description: Gherkin/BDD conventions for this framework — use before writing feature files or steps.
---

# Cucumber Skill

## Purpose

Write business-focused Gherkin and thin step definitions that map to Page Object actions.

## When to Use

- Creating a feature file or step definition.

## Rules

- Describe WHAT the user does, not HOW the DOM works.
- Keep step definitions thin — delegate to Page Objects.
- Use tags for suites: `@smoke`, `@regression`, `@sanity`, `@critical`, `@wip`.
- One feature file per domain under `features/`.
- Reuse existing step definitions; avoid near-duplicate wording.
- Scenarios must be isolated and independent.

## Examples

```gherkin
@smoke @critical
Scenario: Successful login with valid credentials
  Given the user is on the login page
  When the user logs in with valid credentials
  Then the dashboard should be displayed
```

## Anti-patterns

- `When the user clicks the element with id "login-button"`
- Large automation logic inside a step definition

## Validation Checklist

- [ ] Gherkin describes behavior, not DOM
- [ ] Steps are thin
- [ ] Tags applied
- [ ] No duplicate steps
