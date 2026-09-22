# Workflow: Jira Status Update

## Purpose

Update Jira issue results based on the latest test report.

## Steps

1. Read the latest test report (`reports/cucumber-report/cucumber-report.json`).
2. Identify passed, failed, and skipped scenarios.
3. Map scenarios to Jira issues.
4. Update status/result for each mapped issue.
5. Add execution info (timestamp, environment, browser) and failure info when applicable.
6. Link report information when appropriate.

## Rules

- **Never mark a test as PASS if the latest automation result is FAIL.**
- Base updates on the latest report only.
- Do not close or delete issues without approval.
- Credentials from env, never logged.
