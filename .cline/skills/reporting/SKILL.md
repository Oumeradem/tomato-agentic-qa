---
name: reporting
description: Allure and Cucumber reporting conventions for this framework.
---

# Reporting Skill

## Purpose

Produce and interpret Allure and Cucumber HTML/JSON reports, and capture failure artifacts.

## When to Use

- Analyzing test results or generating reports.

## Rules

- Allure results → `reports/allure-results`; generate HTML via `npm run report:allure`.
- Cucumber JSON + HTML → `reports/cucumber-report` (generated during the run).
- Failure artifacts (screenshot, trace, console, error) are attached to Allure automatically on failure.
- Environment info is written to `environment.properties` at the start of a run.
- Do not generate huge artifacts for passing tests unless configured.

## Commands

- `npm run report:allure`
- `npm run report:cucumber`

## Validation Checklist

- [ ] allure-results generated
- [ ] cucumber JSON + HTML generated
- [ ] environment.properties present
- [ ] Failure artifacts attached on failure
