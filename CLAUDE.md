#Git and versioning

-when commiting changes, add changed files ecplicitly 
- before commiting, run `nom run lint` and try to fix problems. Changes should never be commited and pushed to github if
the linter returns warnings or errors


#prefer types over interfaces
- use native Javascript functions when possible
- use Date.toLocaleDateString() instead of a custom made date formatting function

#Architecture
- keep database related queries in own separate files. Group them by features. For example,
code handling storing and retrieving users should be put in an own file while functionality
for operating with exercises should be put in a different file.
-keep xxx.server.ts files as "dumb" as possible and make them delegate to other files. 

#Routes
- keep files in routes directory as "dumb" as possible
- put code for the rendered React component in an own file in the pages directory 

