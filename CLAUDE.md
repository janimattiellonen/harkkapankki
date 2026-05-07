# Git and versioning

-when commiting changes, add changed files explicitly

- before commiting:
  - run `npm run lint` and try to fix problems. Changes should never be commited and pushed to github if
    the linter returns warnings or errors
  - run `npx tsc --noEmit` before committing and fix any possible issues
  - run `npm run format`
    Code conventions

- use native Javascript functions when possible
- use Date.toLocaleDateString() instead of a custom made date formatting function
- follow same naming conventions (files, functions etc) as is previously used in the project
- prefer const over let and var when possible

General development

- if unsure about something, ask, don't guess
- suggest improvements when applicable
- you are allowed to question my instructions or ideas, if my ideas or actions may result in problems
- notify me about possible security issues

Architecture decision records (ADRs)

- ADRs live in `docs/adr/`, numbered sequentially (`0001-...`, `0002-...`), using `docs/adr/template.md`
- propose an ADR when a non-trivial decision is made: picking between real alternatives, adding or removing a feature, changing a cross-cutting pattern, or replacing a library
- skip ADRs for typos, copy tweaks, dependency bumps, and other low-stakes changes
- when an ADR applies, draft it and ask me to review before the PR merges; capture _why this over the alternatives_, not just _what_
- never renumber or delete existing ADRs — supersede them by adding a new one and updating the old one's `Status:` to `Superseded by ADR-NNNN`

New feature workflow

When a feature or non-trivial change is requested, follow these steps in order. If unsure whether a step applies, ask before skipping.

1. Triage. "Small" changes (typo or copy fix, isolated bug fix, dependency bump, behavior-preserving refactor) skip straight to implement + tests + lint. "Big" changes (user-facing feature, new domain concept, cross-cutting change, new dependency, architectural decision, or multi-module impact) follow steps 2–7.
2. Refine the spec with the `grill-me` skill before writing code. For vague initial ideas, start with `agent-skills:idea-refine`. For larger work, follow up with `agent-skills:spec` and `agent-skills:plan`.
3. Open a GitHub issue capturing the problem, agreed solution, and acceptance criteria — before implementation begins. The PR will reference it.
4. Draft an ADR when a non-trivial decision is involved (see ADR rules above). Ask for review before merging the PR.
5. Implement on a feature branch using the existing prefix convention (`feat/`, `fix/`, `chore/`, `refactor/`). Prefer `agent-skills:build` for incremental delivery on larger work.
6. Add tests sized to the change: unit tests for new logic, plus integration or end-to-end tests when the change crosses modules, touches the database, or affects a user-visible flow. Use `agent-skills:test` for TDD on bug fixes.
7. Run the pre-commit checks above, then open a PR (use `commit-push-pr`) linking the issue and any ADR.
