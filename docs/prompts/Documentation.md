# Documentation

Write a non-technical project summary that describes in detail what features the project provides.

A non-technical user that has no previous knowledge of the project, should be able to get a good picture of
what the project does and provides.

Store the written summary in `docs` directory.

## Clarify project vision and reasons for existence

Help me to refine and clarify why this project exists and what it aims to solve.

Use /Users/janimattiellonen/Documents/Development/Frisbeegolf/Harkkapankki/docs/Project summary.md
as a reference.

## Answers to Claude's quetions

### 1. The actual pain (problem statement)

Between april and october, I run weekly training sessions for kids under 18 years.

Each training session contains certain fixed parts:

- introduction (we greet each others and change recent happenings)
- warmup
- putting practice
- throwing practise
- closing

I need to come up with a new programme for each weeks' training session. I usually come up with
the programme a day before, or even just hours before the session.

I created this project as a tool that would allow me to create content for each training session
more easily and with less pain.

### 2. Origin & stake

Currently I'm only experimenting a bit. A lot of the exercises are been scraped from https://junnufriba.fi
I'm kind of "ere-creating" that website but with improved tools for creating the training
sessions. I'm planning to contact the owner of https://junnufriba.fi/ and present my project to
see, if they might be interested in it.

### 3. Why not an existing tool

I wanted to see, if I could create a better version of https://junnufriba.fi/ (see previous answer).

### 5. Success criteria

A definitive success criteria would be that https://junnufriba.fi/ would start using this project.

A more personal success criteria in this current state would be that the project would really
make it easy for me to create training sessions for several weeks, if not for the whole season,
where the content of each training session would contain a varied types of practises etc so
that no training session would feel like every other training session. What would be even greater,
is that if the project would create training sessions for the whole season and create the contents
in a way that the training sessions would follow a certain plan (progressively teach different
techniques throughout the season in a logical order)

## Next steps

Currently, the project does not contain all the material found in junnnufriba.fi. This is fine
for now, but it might become an issue when the project can be used to create a 10-week training
programme: not enough material to create varied training sessions.

This does not prevent us from implementing the season planning feature.

Start working on a plan that assesses current features (code, database structure etc.) and how well
they can be used for implementing the season planning feature.

List possible issues and blockers. Suggest fixes for these. List changes required to the current
database structure and code. A solid database structure is the foundation for the new feature.

There is no concrete plan on what the season planning feature should contain.

- a "season" might be 2 weeks or 20 weeks
- each training session is normally held once a week, on a specific weekday and time and has a
  specific length: wednesdays, 17.00 - 18.30 (1,5 hours) but the weekday, start and end times
  might vary
- there might be gaps between training session (summer vacation, sick days etc.)

Answers to Claude:

"Decision 1 — Is "season" a first-class entity?"

Yes

"Decision 2 — Schedule sessions to specific dates?"

A. Scheduled -> I don't know in advance exactly, what weeks I may skip and when the final
training session will be. Previous two seasons ended in mid october. I may add, delete or edit
training sessions during the season. I might want to have a feature that allows me to create 3
new training sessions in a row or use a calendar component for choosing which upcoming weeks
will have a training session. We can deal with the implementation details later, as long as the
database structure supports this.

"Decision 3 — Variable session lengths?"

For now, the 60/90 works fine.

"Proposed schema (assuming yes / A / option-1)"

Do we need `weekNumber`? can't we infer it from `scheduledAt`?

"Issues / blockers / risks"

"1. Doc 16 should land first"

This is basically done.

"Phased rollout"

Phase 0 (prerequisite): Already resolved

" 2. Existing standalone sessions — leave them be?"

Can be left as they are. Just examples.

"3. Auto-generation of session dates at season-creation time?"

Correct

"write this to docs/18 - season planning feature plan.md"

Yes
