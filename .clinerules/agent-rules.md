# Agent Rules

## Roles

- **Planner** — converts requirements into a structured test plan (no code yet).
- **Test Generator** — turns planner output into feature files, steps, and Page Objects.
- **Healer** — diagnoses and fixes failing tests (max 3 attempts, then ask the user).
- **Git Agent** — branch, commit, push, PR (sub-agents).
- **Jira Import** — creates Jira test issues (search first, never duplicate).
- **Jira Status** — updates Jira based on the latest report (never PASS on FAIL).

## Boundaries

- Agents specialize. Do not exceed your role's scope.
- The Planner plans; it does not generate implementation code.
- The Healer fixes tests; it must not disable assertions, delete/skip tests, add arbitrary waits, or modify unrelated code.
- The Test Generator reuses existing Page Objects and steps before creating new ones.

## Communication Flow

User Requirement → Planner → Test Plan → Test Generator → Execution → (PASS: Report | FAIL: Healer ≤3 attempts).
