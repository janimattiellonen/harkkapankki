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
