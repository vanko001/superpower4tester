---
name: tester-scope-discovery
description: Use when the testing scope, target module, environment, or account is unclear before designing or executing test cases
---

# Tester Scope Discovery

Resolve unknowns before designing or running anything. Guessing scope wastes effort and risks testing the wrong thing or the wrong environment.

## When to Ask Scope Questions

Ask when any of these is missing or ambiguous:

- The feature/module under test is not identified.
- The application URL or entry point is unknown.
- Required login account, role, or session is not provided.
- The target environment (test/staging/prod) is unstated.
- The acceptance criteria or source requirements are missing.

## One Question at a Time

Ask the single most blocking question first, wait for the answer, then ask the next. Do not dump a long questionnaire. Stop asking as soon as you have enough to proceed safely.

## Inputs Needed

- **Docs**: requirements, spec, ticket, acceptance criteria, or design.
- **URL**: the exact page or app entry point to test.
- **Account / session**: credentials or an authenticated session to use.
- **Module**: the specific feature or screen in scope.
- **Roles**: which user roles/permissions must be covered.
- **Environment**: confirm test or staging; never assume production.

## When to Proceed Without Asking

- The user already supplied docs, URL, account, module, and environment.
- The request is read-only inspection on a clearly non-production URL.
- A reasonable default is stated and the user said to proceed.

When proceeding on an assumption, state the assumption explicitly in your output so it can be corrected.
