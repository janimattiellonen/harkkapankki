#Git and versioning

-when commiting changes, add changed files ecplicitly 
- before commiting, run `nom run lint` and try to fix problems. Changes should never be commited and pushed to github if
the linter returns warnings or errors
- also run `npx tsc --noEmit` before committing and fix any possible issues

Code conventions

- prefer types over interfaces
- use native Javascript functions when possible
- use Date.toLocaleDateString() instead of a custom made date formatting function
- follow same naming conventions (files, functions etc) as is previously used in the project
- prefer const over let and var when possible

#Architecture
- keep database related queries in own separate files. Group them by features. For example,
code handling storing and retrieving users should be put in an own file while functionality
for operating with exercises should be put in a different file.
- keep xxx.server.ts files as "dumb" as possible and make them delegate to other files. 

#Routes
- keep route files clean of html code when possible. Use a page component for the actual content

General development
- if unsure about something, ask, don't guess
- suggest improvements when applicable
- you are allowed to question my instructions or ideas, if my ideas or actions may result in problems
- notify me about possible security issues