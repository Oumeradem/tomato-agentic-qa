# Workflow: Create Test

## Purpose

Create a new automated BDD test end-to-end from a requirement.

## Steps

1. **Planner Agent** — convert the requirement into a structured test plan (no code yet). Use Playwright MCP to inspect the app when available.
2. **Test Generator Agent** — read the plan, analyze the existing framework, reuse existing Page Objects/steps, and generate:
   - Feature file under `features/`
   - Step definitions under `src/steps/`
   - Page Objects under `src/pages/` (only when needed)
3. **Validation** — run the new test: `npm run test:smoke` or a targeted run.
4. **Report** — confirm the scenario passes; capture failures for the Healer.

## Rules

- Search before creating anything new (no duplicates).
- Follow locator priority and keep steps thin.
- Never hardcode credentials or URLs.
- Do not modify unrelated files.

## Output

Feature file + steps + Page Objects + validation result.
