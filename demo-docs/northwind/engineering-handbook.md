# Engineering Handbook

**Owner:** Engineering · **Version:** 6.0 · **Last updated:** 25 February 2026

## 1. Branching
We use trunk-based development. Create a short-lived branch from `main`, named `type/short-description`, for example `fix/login-timeout`.

## 2. Code review
- Every change needs one approval before merge.
- Keep pull requests under 400 changed lines where you can.
- Reviewers reply within one working day.
- Authors merge their own pull request after approval and a green build.

## 3. Testing
New code needs tests. The build must pass unit and integration tests before merge.

## 4. Deploys
- `main` deploys to staging automatically.
- Production deploys happen from the release pipeline, Monday to Thursday, before 4pm.
- No production deploys on Fridays unless it is a fix for an incident.

## 5. Rolling back
If a release causes errors, roll back first, investigate second. Use the "Rollback" button in the release pipeline.

## 6. On-call
Each team has a weekly on-call rotation. Engineers on call carry the pager from Monday 10am to the next Monday 10am. On-call is paid and comes with a day off in lieu.

## 7. Documentation
Write a short design note for any change that touches more than one service.
