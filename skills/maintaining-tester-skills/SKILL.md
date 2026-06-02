---
name: maintaining-tester-skills
description: Use when creating or editing superpower4tester skills, to keep frontmatter, triggers, and naming correct and tested
---

# Maintaining Tester Skills

Keep the superpower4tester skill set consistent, well-triggered, and test-backed.

## Skill File Contract

- Each skill lives at `skills/<name>/SKILL.md` where `<name>` equals the directory name and the frontmatter `name`.
- Frontmatter is exactly:
  ```
  ---
  name: <exact-name>
  description: <one line>
  ---
  ```
- The `description` must be a single physical line starting with `Use when` — no line wrapping, no YAML block scalars (`>-`, `|`).

## Trigger Quality

- The `description` should name the concrete situation that should invoke the skill so it fires at the right moment.
- Keep skills small and single-purpose; route to other skills rather than duplicating content.

## Avoid Upstream Name Collisions

Never reuse upstream Superpowers skill names for tester skill directories: `brainstorming`, `writing-plans`, `executing-plans`, `verification-before-completion`, `systematic-debugging`, `requesting-code-review`, `dispatching-parallel-agents`, `subagent-driven-development`, `writing-skills`, `test-driven-development`, `finishing-a-development-branch`, `using-git-worktrees`, `receiving-code-review`. Use tester-specific names.

## Use Tests

- The contract test `tests/skill-frontmatter.test.mjs` checks that every expected skill exists, that `name` matches the directory, that `description` starts with `Use when`, and that no directory collides with an upstream name.
- Run `npm test` after any skill change.
- Verify the session-start hook still surfaces the entry skill: `hooks/session-start | grep -q "using-superpower4tester"`.
- The plugin name is always `superpower4tester` (never `superpower5tester`).
