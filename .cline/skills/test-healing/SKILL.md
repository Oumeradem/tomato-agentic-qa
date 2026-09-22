---
name: test-healing
description: Diagnosis and repair of failing tests. Maximum 3 attempts.
---

# Test Healing Skill

## Purpose

Diagnose and fix failing tests reliably without masking real failures.

## When to Use

- A test is failing (Healer Agent).

## Process

1. Analyze the failure and error message.
2. Inspect the screenshot and trace.
3. Inspect the relevant Page Object and feature file.
4. Identify the root cause.
5. Apply the smallest fix.
6. Re-run the test.
7. Validate.

## Attempt Limit

Maximum **3 attempts**. After 3 failures, STOP and ask the user.

## Rules

- Never disable assertions, delete/skip tests, or add arbitrary waits.
- Never replace good locators with XPath unnecessarily.
- Never modify unrelated code or change requirements.

## Validation Checklist

- [ ] Root cause identified
- [ ] Smallest fix applied
- [ ] Test re-run and validated
- [ ] ≤ 3 attempts
