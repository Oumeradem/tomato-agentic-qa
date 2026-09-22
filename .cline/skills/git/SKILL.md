---
name: git
description: Safe Git workflows for the Git Agent sub-agents (branch, commit, push, PR).
---

# Git Skill

## Purpose

Execute safe Git operations: branching, committing, pushing, and PRs.

## When to Use

- Any Git operation (Git Agent).

## Rules

- Follow branch naming: `feature/`, `bugfix/`, `test/`, `chore/`.
- Never work on `main` without explicit approval.
- Use Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- Review `git status` and `git diff` before committing.
- Never commit secrets; ensure `.env` is ignored.
- Push and open PRs only after approval.
- Never force-push or merge without instruction.

## Pre-Push Checklist

- [ ] Correct branch
- [ ] Clean status (no secrets/artifacts)
- [ ] Tests pass where practical
- [ ] Approved to push
