---
name: jira
description: Jira import and status-update conventions. Never create duplicates; never mark PASS on a FAIL.
---

# Jira Skill

## Purpose

Sync automation scenarios with Jira test cases, and update status based on the latest report.

## When to Use

- Jira Import Agent (create test cases).
- Jira Status Update Agent (update results).

## Rules

- Config comes from env: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`.
- **Search for duplicates before creating** any Jira issue. If one exists, report it.
- Create issues only when approved.
- Base status updates on the latest report only.
- **Never mark a test PASS if the latest result is FAIL.**
- Never close or delete issues without approval.
- Never log credentials or tokens.

## Import Checklist

- [ ] Duplicate search performed
- [ ] Preserves feature, scenario, steps, expected results, tags, priority
- [ ] Approved before creating
