# Security Rules

- **Never** hardcode credentials, tokens, API keys, or cookies.
- `.env` is git-ignored. Only commit `.env.example` with placeholders.
- Sensitive values must never appear in:
  - Source code, feature files, git history, reports, screenshots, logs, or agent prompts.
- In CI/CD, use GitHub Secrets or Jenkins Credentials, mapped to env vars that the config layer reads.
- The logger and console-message capture filter out likely secrets (passwords, tokens, cookies).
- Before committing or pushing, verify no secrets are staged (`git diff`, `git status`).
