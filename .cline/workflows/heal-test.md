# Workflow: Heal Test

## Purpose

Diagnose and fix a failing test.

## Steps

1. **Healer Agent** — analyze the failed test, error, screenshot, trace, Page Object, and feature file.
2. Identify the probable root cause.
3. Apply the smallest fix (max 3 attempts).
4. Re-run the affected test after each attempt.
5. Validate the result.

## Attempt Limit

- Maximum **3 attempts**.
- After 3 failures, STOP and ask the user for help. Never attempt a 4th fix.

## Rules

- Never disable assertions, delete/skip tests, or add arbitrary waits.
- Never replace good locators with XPath unnecessarily.
- Never modify unrelated code or change requirements.

## Report on Stop

State the failure, the 3 attempts, and a recommended next action, then ask the user.
