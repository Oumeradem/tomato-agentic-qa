# Git Rules

## Branching

- Never work directly on `main` unless explicitly approved.
- Follow branch naming:
  - `feature/<description>`
  - `bugfix/<description>`
  - `test/<description>`
  - `chore/<description>`

## Commits

- Follow [Conventional Commits](https://www.conventionalcommits.org):
  - `feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`
- Before committing: run `git status` and `git diff` to review changes.
- Never commit secrets; ensure `.env` is ignored.

## Push & PR

- Check current branch, status, and remote before pushing.
- Push only after approval.
- PRs must have a meaningful title, summary, test coverage notes, and known failures.
- Never merge or force-push without explicit instruction.
