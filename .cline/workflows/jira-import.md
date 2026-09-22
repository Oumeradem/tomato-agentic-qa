# Workflow: Jira Import

## Purpose

Import generated scenarios into Jira as test cases.

## Steps

1. Read the generated feature files.
2. **Search Jira for duplicates first.**
3. If an equivalent test exists — do NOT create another issue; report the existing issue.
4. Otherwise, prepare Jira test cases preserving feature, scenario, preconditions, steps, expected results, tags, and priority.
5. Get explicit approval before creating issues.
6. Create the issues via the configured Jira integration.

## Rules

- Never create duplicate issues blindly.
- Credentials come from env: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`.
- Never log credentials.
