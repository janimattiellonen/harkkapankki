# Harkkapankki — Project Summary

## Why Harkkapankki exists

Between April and October, the project's author runs weekly disc golf training sessions for under-18 juniors. Each session follows the same arc — introduction, warm-up, putting, throwing, closing — but the _content_ needs to be different every week, and a new programme is usually put together the day before, sometimes only hours before. That recurring last-minute planning chore is the original problem the application is meant to solve.

### The personal goal

Make weekly session planning fast and dependable: open the app, pick exercises from a personal bank, and have a balanced 60- or 90-minute session ready in minutes instead of starting from a blank page every Sunday evening.

### The longer-term goal

Eventually the application should plan not just _one_ session but a **whole season** — a sequence of weekly sessions that vary deliberately (so no two practices feel the same) and progress logically (so techniques are introduced and built on in a sensible order). This is the north star, not the current state.

### The bigger picture: junnufriba.fi

The Finnish junior disc golf community already has a shared resource at [junnufriba.fi](https://junnufriba.fi). Harkkapankki is being built as an improved successor — similar content, but with proper tooling for browsing the exercise bank and assembling sessions out of it. Once the project is solid enough, the intention is to **offer it to the owner of junnufriba.fi free of charge**, as a contribution to Finnish junior disc golf coaching. There is no commercial intent behind the project.

---

## What is Harkkapankki?

**Harkkapankki** (Finnish for "Practice Bank") is a web application that helps disc golf coaches and players plan structured practice sessions and maintain a library of training exercises. Instead of writing training plans on paper or in scattered documents, users can build a personal — or shared — collection of disc golf drills, then assemble them into ready-to-run practice sessions of a chosen length.

The application is aimed at junior coaches, club trainers, and serious players who want a repeatable, organised way to plan and run training. It is currently available in **Finnish and English**, and the user can switch between languages at any time.

---

## What the application does, in plain language

At the highest level, Harkkapankki provides three things:

1. **An exercise bank** — a searchable, filterable library of disc golf training drills.
2. **A practice session designer** — a tool for putting together a complete, time-balanced training session from those drills.
3. **A library of saved practice sessions** — every session the user designs can be saved, reopened, edited, and reused.

The home page surfaces these three core activities directly: _Design a practice session_, _Exercise bank_, and _Create a new exercise_.

---

## Feature 1 — The Exercise Bank

The exercise bank is where individual training drills live. Each exercise is a self-contained training instruction that a coach or player can read, follow, and reuse in any number of practice sessions.

### What information an exercise contains

Each exercise stores:

- **A name** — the title of the drill (for example, "Putting from 5 metres" or "Backhand grip basics").
- **A short description** — a one- or two-line summary that appears in lists and search results.
- **Detailed content** — the full instructions for the drill, written in a rich text editor that supports formatted text, lists, headings, and embedded YouTube videos.
- **An image** (optional) — a photo or diagram illustrating the drill. Users can upload images directly and replace or remove them later.
- **A YouTube tutorial link** (optional) — a link to a video demonstration.
- **A duration** — how many minutes the drill is expected to take.
- **An exercise type** — a category that places the drill within the project's training taxonomy (see below).

### Exercise categories (the type hierarchy)

Exercises are organised into a two-level category tree so they can be found and filtered by topic. The current categories are:

- **Technique**
  - Backhand
  - Sidearm (forehand)
  - Putting
  - Driving
- **Supplementary exercises**
  - Motor skills exercises
  - Strength training
  - Warm-up exercises
  - Muscle condition
- **Games, plays and challenges**
  - Throwing games
  - Warm-up games
  - Putting games

Every exercise is assigned to one of these categories or sub-categories, which keeps the bank organised as it grows.

### Browsing, searching and filtering

The exercise list page is the user's main way to explore the bank. It offers:

- **A list of all exercises**, each shown as a card with the exercise's name, creation date, type path (e.g. _Technique › Backhand_), short description, thumbnail image, and duration.
- **Search by title** — a search box that filters the list to exercises whose names match the typed text. The user is prompted to type at least three characters before the search becomes meaningful.
- **Filter by exercise type** — an expandable "More filters" panel with checkboxes for each category and sub-category. Users can pick a whole category (e.g. _Technique_) or zoom in on specific sub-categories (e.g. _Putting_ only). Parent checkboxes show an indeterminate state when only some of their children are selected.
- **A "Clear filters" button** for quickly returning to the full list.
- **An empty-state message** that explains what to do when filters return no results.
- **Loading indicators** while the page is fetching results.

### Creating, editing and deleting exercises

From the exercise list, users can:

- **Add a new exercise** through a dedicated form. The form validates input as the user types, requires the most important fields, and asks for a category before saving.
- **Edit an existing exercise** by opening its detail page and clicking _Edit_. All fields can be changed, including swapping or removing the image.
- **Save and continue** when creating an exercise — a convenience option that lets the user save the current drill and immediately start writing a new one, useful when entering many exercises in a row.
- **Delete an exercise**, with a confirmation dialog warning that the action is permanent. Successful deletions show a confirmation banner on the list page.
- **Remove an attached image** with a confirmation dialog, with a clear warning that the change is applied when the form is saved.

### Reading an exercise

Opening an exercise reveals a detail page showing:

- The exercise's name and creation date.
- The full description and rich-text content, with any embedded YouTube videos rendered inline.
- The full image (when one is attached).
- The duration in minutes.
- The category path the exercise belongs to.
- A separate link to the YouTube tutorial, when present.
- An _Edit_ button for jumping to the edit form.

---

## Feature 2 — The Practice Session Designer

The session designer is where individual exercises and exercise types come together to form a real, runnable training session.

### Choosing the length of the session

Every practice session is either **60 minutes** or **90 minutes** long. The user picks the length first, and the rest of the page reacts to that choice — every section's allocated time updates automatically.

### Naming and describing the session

Each session must have a **name** (required) and may have an optional **description** for the coach's own notes — for example, "Beginners group, week 3" or "Putting-focused tune-up before tournament weekend".

### The five-section structure

A practice session is organised into five fixed sections that follow a typical training arc:

1. **Introduction** (5 min for both 60- and 90-minute sessions)
2. **Warm-up** (10 min in a 60-minute session, 20 min in a 90-minute session)
3. **Games, plays and challenges** (5 min in a 60-minute session, 10 min in a 90-minute session)
4. **Technique** (the largest block; remaining time is allocated here)
5. **Closing**

Each section has its own time budget, which automatically adjusts based on the session length. The designer shows the duration on each section header so the user always knows how much time they are filling.

### Adding items to a section

Within each section, the user can add items in two ways:

- **Add a generic exercise type** — for example, simply note that the _Introduction_ section will cover the _throwing order_, without picking a specific drill. This is useful for routine activities that do not need a written-up exercise.
- **Add a specific exercise from the bank** — pick an exercise type (e.g. _Putting_), then pick one of the saved exercises that belong to that type. The exercise's name appears in the section's plan.

The designer is smart about availability:

- Once a generic type is added to a section, it is hidden from the dropdown so it cannot be added twice.
- Once a specific exercise is added, it is removed from the available exercises list. If all exercises for a given type have been added, the type itself disappears from the menu.

### The running time summary

A sticky **summary panel** shows the total time allocated to the session as the user adds items. This makes it easy to see at a glance whether the session is filling up correctly relative to the chosen 60- or 90-minute target.

### Validation and saving

Before a session can be saved:

- The session must have a name.
- At least one item must have been selected in any section.

If either is missing, the user sees a clear error message and the form does not submit.

---

## Feature 3 — The Practice Sessions Library

Every session designed in the application is saved and listed on the _Practice Sessions_ page. From there the user can:

- **Browse all saved sessions**, each shown with its name (or "Untitled session" if blank), creation date, total length in minutes, and the number of items it contains.
- **See the full plan** of any session by clicking it. The detail view groups items by section, numbers them in order, and links specific exercises directly to their full instructions in the exercise bank.
- **Edit a session** to change its name, description, length, sections or items.
- **Delete a session**, with a confirmation dialog warning that the action is permanent.
- **Open exercise details from within a session**, in a new tab, so the coach can read the instructions without losing their place in the plan.
- **Return to the session list** with a clearly visible _Back to Practice Sessions_ link.

A clear empty state appears when the user has not yet created any sessions, with a call-to-action button to design their first one.

---

## Other things the application does

### Multilingual interface (Finnish and English)

The whole interface — buttons, labels, error messages, exercise type names, section names — is fully translated. A language switcher lets the user toggle between Finnish ("FI") and English ("EN") at any time. New users default to Finnish, which matches the project's primary audience.

### Rich content with YouTube videos

Exercise content is written in a Markdown editor with extra controls for inserting YouTube videos. The user can paste either a full YouTube URL or just the 11-character video ID; the application validates the input and rejects invalid links with a helpful message. When the exercise is later viewed, the embedded videos are rendered as actual playable players inside the page.

### Image uploads

Each exercise can have an associated image. Users can upload common image formats (JPEG, PNG, GIF, WebP), see the current image when editing, and remove it through a confirmation dialog if they no longer want it associated with the exercise.

### Friendly URLs (slugs)

Both exercises and practice sessions have human-readable URLs based on their names. When two items would otherwise share the same URL, the application automatically adds a numeric suffix to keep each link unique. Slugs can also be regenerated in bulk via a maintenance script.

### Bulk content import (for content managers)

In addition to creating exercises one at a time through the user interface, the project ships with command-line tools for content managers:

- A **web crawler** that can read training material from local HTML files, single web URLs, or a list of files/URLs, and convert it into a structured format (Markdown).
- An **import script** that takes the parsed output and inserts it into the application's exercise bank in bulk, automatically generating slugs and validating the data.

This is intended for situations where existing training material — for example, an external training website — needs to be brought into Harkkapankki without manual re-entry.

---

## Who the application is for

- **Coaches** who want a single source of truth for the drills they teach, instead of a folder of PDFs or messy notes.
- **Junior team trainers** who run regular structured sessions and want to vary the content week to week without rebuilding a plan from scratch every time.
- **Players** who want to plan and follow their own self-coached practice sessions in a disciplined way.

The interface is deliberately simple and visual: every screen explains what it is for, every action gives clear feedback, and the flow from "I have an idea for a session" to "here is the printable plan" is meant to take only a few minutes.

---

## What the application does _not_ (yet) do

To set expectations honestly:

- There is **no user account or login** — the application currently treats all data as shared. Anyone using the same instance sees the same exercise bank and the same saved sessions.
- There is **no per-user permission system**, meaning anyone with access can create, edit, or delete any exercise or session.
- There is **no calendar, attendance, or roster feature** — Harkkapankki plans sessions, but does not track who attended which session.
- There is **no print-optimised view or PDF export** of a finished session — users can read the plan on screen and follow the links to individual exercises.

These are noted only so that a non-technical reader has an accurate picture of the current scope.
