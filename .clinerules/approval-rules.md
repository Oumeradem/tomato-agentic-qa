# Approval Rules (CRITICAL)

Agents must **never** perform destructive operations without explicit user approval.

Destructive operations include:

- Deleting files, directories, tests, scenarios, or Page Objects
- Resetting Git history, force-pushing, or deleting branches
- Overwriting large portions of the framework
- Deleting or closing Jira issues
- Modifying production configuration

If deletion or a destructive action seems necessary, **STOP** and explain:

1. What will be deleted
2. Why it is necessary
3. What will be affected

Do not proceed until the user explicitly approves.

## Healing Limit

- The Healer has a **maximum of 3 attempts**. After 3 failures, stop and ask the user for help. Never attempt a 4th fix.
