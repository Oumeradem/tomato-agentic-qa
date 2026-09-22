---
name: environment-management
description: Multi-environment configuration conventions for this framework.
---

# Environment Management Skill

## Purpose

Manage dev/qa/stage/prod environments and credentials without hardcoding.

## When to Use

- Configuring environments, running tests in a specific env, or adding credentials.

## Rules

- Select env with `ENV=qa npm test`.
- Environment values live in `src/config/environments/*.ts`; merged in `src/config/config.ts`.
- Never hardcode URLs — use `config.baseUrl`.
- Credentials come from `.env` via `config.credentials.*`.
- `.env` is git-ignored; only `.env.example` is committed with placeholders.
- In CI/CD use GitHub Secrets / Jenkins Credentials.

## Commands

- `ENV=qa npm test`
- `ENV=stage BROWSER=firefox npm test`
- `HEADLESS=false npm test`

## Validation Checklist

- [ ] baseUrl from config, not hardcoded
- [ ] No credentials in code
- [ ] .env ignored, .env.example present
