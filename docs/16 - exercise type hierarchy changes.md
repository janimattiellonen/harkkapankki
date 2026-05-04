# Exercise type hierarchy changes

Enter plan mode. Do not change anything yet. We need a good plan first.

When creating a new practise session (http://localhost:5177/practise-sessions/new) the hierarchy is:

Alku:

- Heittojärjestys
- OB-säännöt

Alkulämmittely:

- Motoriikklaharjoitteet
- Lihaskunto
- Voimaharjoitteet

etc..

All sections have 1 level.

I have a new section, "Pelit, leikit ja haasteet", which have a new level before the actual exercises.
This new level has 3 items at the moment:

- Heittopelit
- Lämmittelypelit
- Puttipelit

of which the last one was just previously scraped. The "Puttipelit" contains 13 putting games that where
inserted into database.

Currently I would either add those three intermediate "levels" under the new section "Pelit, leikit ja haasteet"
or I would have to add all exercises under those three "levels".

I would like to be able to first select the "level" and then one exercise from the selected "level",
for example "Puttikisa" or "360 putti" from "Puttipelit" or some other exercise from "Heittopelit".

For reference, I'll attach a couple of screenshots from the "New practise session" form so that you can see,
how I can select items.

There could in theory be more levels in the hierarchy.

There are some issues with current implementation, that will only get worse, if a new hierarchy level is
added:

the select lists in the form only display the name of the exercise type. It can be difficult to know what the
exercise type is about without mroe information.

This leads us to the next issue: currently all items in the select list on in the form are just exercise types.

With the addition of "Pelit, leikit ja haasteet" and its 3 items "Heittopelit", "Lämmittelypelit" and
"Puttipelit", I want to list the EXERCISES for the selected item. This is contradictory to the current logic
which only shows exercise types. In this case we want to show exercises.

Showing the actual exercises might be the correct way anyway.

Notably some exercise types only have one exercise and that incidentally works as the exercise type name is
often the same as the exercise in this case.

When viewing the practise-session (for example http://localhost:5177/practise-sessions/sss), it lists the
sections and the selected exercise types, not the actual exercises. This page would also benefit from the
change that exercises are displayed under each exercise type when:

- creating as new practise session and selecting a specific exercise type
- editing a practise session
- viewing the practise session

## Changes to "View practise session" page

- if the exercise type name only has one selected exercise and the names are identical, just show the name
  once:
  - now: "Motoriikkaharjoitteet: Motoriikkaharjoitteet"
  - after fix: "Motoriikkaharjoitteet"
  - if the exercise type has 2 or more exercises, show the exercise type nsame once and list the excersices
    below
- if exercises are added, make the exercise a clickable link to the exercise view page (make it open in a
  new tab)
