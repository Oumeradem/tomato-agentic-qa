# Cucumber Rules

- Write Gherkin that describes **business behavior**, not DOM implementation.
  - Good: `When the user logs in with valid credentials`
  - Bad: `When the user clicks the element with id "login-button"`
- One feature file per domain area under `features/`.
- Use tags for suites: `@smoke`, `@regression`, `@sanity`, `@critical`, `@wip`.
- Keep step definitions **thin**. Business logic belongs in Page Objects / helpers.
- Reuse existing step definitions before writing new ones.
- Scenarios must be independent and isolated. No shared browser state, cookies, or data.
- Match existing step wording; avoid duplicate steps with slightly different phrasing.
