---
disable-model-invocation: true
description: Fix a GitHub issue end-to-end with branch, implementation, tests, and PR
---

# Fix Issue

When the user invokes `/fix-issue`, follow these steps:

1. **Read the issue**: Use `gh issue view <number>` to understand the problem, acceptance criteria, and labels.

2. **Create branch**: `git checkout -b fix/<issue-number>-<short-description>` from `main`.

3. **Investigate**: Search the codebase to understand the root cause. Read relevant files before making changes.

4. **Implement the fix**:
   - Follow project conventions (see root CLAUDE.md and per-app CLAUDE.md)
   - Keep changes minimal and focused
   - Don't refactor unrelated code

5. **Write/update tests**: Add tests that cover the fix. Run `pnpm test` to verify.

6. **Verify quality**:
   - `pnpm typecheck` - no type errors
   - `pnpm lint:fix` - no lint issues
   - `pnpm test` - all tests pass

7. **Commit**: Use conventional commit format: `fix: <description> (#<issue-number>)`

8. **Create PR**: Use `gh pr create` with:
   - Title referencing the issue
   - Description explaining the root cause and fix
   - Link to the issue with `Closes #<number>`
