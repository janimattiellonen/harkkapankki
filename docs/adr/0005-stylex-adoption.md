# 0005. Adopt StyleX alongside Tailwind for component styling

- **Status:** Accepted
- **Date:** 2026-04-01 (first attempt, reverted same day) → 2026-05-03 (re-adoption merged), retroactively documented 2026-05-07
- **Deciders:** janimattiellonen
- **Related:** PR #30 (initial — merged then reverted), PR #31 (re-adoption with token system), spec at `docs/stylex.md`

## Context

The codebase started on Tailwind CSS for styling. As components grew, two
problems emerged:

1. **No design tokens.** Colour, spacing, and typography choices were
   inline Tailwind classes with no semantic indirection — `bg-blue-600`
   rather than `bg-buttonPrimary`. Refactoring the design palette would
   require touching every component.
2. **Implicit duplication.** Common patterns (button variants, card
   layouts) were re-expressed as Tailwind class strings in each
   component. There was no enforced shape for "primary button".

StyleX (Meta's atomic CSS-in-JS library) was attractive because it
combines:

- Co-located styles (no separate file, no class-name churn).
- Type-checked references — typos in token names fail the build.
- Atomic CSS output — comparable bundle behaviour to Tailwind.
- A `defineVars` system explicitly designed for semantic theme tokens.

The plan was to introduce StyleX **alongside** Tailwind rather than
replace it wholesale: convert hot spots (Button component, key cards)
incrementally; let Tailwind continue to handle layout/utility classes
during the transition.

## The false start (PR #30)

The first attempt — installing `@stylexjs/unplugin`, configuring the
Vite plugin, converting `PractiseSessionSummary` and creating
`Button.tsx` — was merged as PR #30, then **reverted within the same
hour** (commits `d6e83cd` → `f3d2dec`, four seconds apart on the merge
timeline).

The reason isn't recorded in the revert commit message (just
"Revert..."). The actual cause was discovered during the re-attempt:

> **The Vite plugin was configured with `useCSSLayers: true`** (the
> StyleX-recommended default). This wraps StyleX-generated CSS in a
> `@layer` rule. Tailwind's base reset (also in a layer) then **won the
> cascade** for the same properties, so Button's StyleX styles were
> visually overridden by Tailwind's `button` reset. Buttons looked
> unstyled despite the StyleX classes being present in the DOM.

Two paths from there:

- Strip out Tailwind's preflight/reset (giant, repo-wide).
- Disable CSS layers in StyleX so its rules sit at normal specificity
  and beat the reset.

We chose the second.

## Decision

Re-adopt StyleX (PR #31) with two concrete changes vs. the first
attempt:

1. **`useCSSLayers: false`** in `vite.config.ts`. This is the load-bearing
   line — without it, StyleX coexists badly with Tailwind's reset:
   ```ts
   stylexUnplugin.vite({
     useCSSLayers: false,
     // ...
   });
   ```
2. **Centralised design tokens** in `app/styles/`:
   - `tokens.stylex.ts` — semantic design vars (`textPrimary`,
     `buttonPrimaryBackground`, etc.) defined via `defineVars`.
   - `constants.stylex.ts` — raw spacing / font-size / radius scales.
     Components consume tokens, never raw colour or pixel values.
3. **A shared `Button` component** with `primary`, `secondary`, `danger`,
   `ghost`, and `icon` variants. All 19 `<button>` elements in the app
   were converted to use it.

Tailwind stays in place for layout utilities (`flex`, `grid`, breakpoint
prefixes, spacing utilities). StyleX is used for components and
themable surfaces. Migration of remaining components is incremental.

## Alternatives considered

- **Stay on Tailwind only, adopt CSS variables for theming.** Rejected:
  solves the token problem but doesn't address component-shape
  duplication or give us a typed authoring experience.
- **Adopt vanilla-extract** (similar Meta-adjacent ergonomics).
  Rejected: smaller ecosystem in 2026, less aligned with React Server
  Components / RR7 patterns than StyleX.
- **Strip Tailwind entirely and go all-in on StyleX.** Rejected:
  rewriting every layout and utility class would be a multi-week effort
  with no incremental value. Hybrid is fine.
- **Use `vite-plugin-stylex` instead of `@stylexjs/unplugin`** — the
  alternative the spec doc compared against
  (`docs/stylex.md` notes another RR7 setup using this). Rejected: the
  unplugin variant is published by the StyleX team, supports the same
  features, and the cause of our cascade issue (`useCSSLayers`) is a
  StyleX-level config, not a plugin choice.
- **Keep first-attempt config (`useCSSLayers: true`) and remove
  Tailwind's base reset.** Rejected: Tailwind preflight does a lot of
  work the codebase implicitly depends on (form-element resets, image
  defaults). Disabling CSS layers is a one-line fix vs. an unknowable
  blast radius.

## Consequences

### Positive

- Theme tokens are now type-checked. Renaming a token surfaces every
  consumer; missing tokens fail the build.
- Button variants are defined in one place; changes to "what a primary
  button looks like" are now a single-file edit.
- StyleX and Tailwind coexist without specificity surprises.
- The design tokens ladder (raw `constants.stylex.ts` →
  semantic `tokens.stylex.ts` → component styles) is the canonical
  pattern for future styling work.

### Negative / costs

- **`useCSSLayers: false` is a non-default setting tied to a specific
  cascade interaction with Tailwind.** If Tailwind is ever removed or
  its reset moved out of `@layer`, revisit this setting. This is the
  single most easily-forgotten detail of the migration — it lives in
  this ADR specifically because it would otherwise be lost.
- Two styling systems means two mental models. Contributors need to
  know when to reach for StyleX (component-shape, themable) vs.
  Tailwind (layout, one-off utility).
- Incremental migration means the codebase will be in a hybrid state
  for some time. New components should default to StyleX for visual
  styling; older components may still be Tailwind-only.
- The original PR #30 lives in git history as merged-then-reverted —
  GitHub still shows it as merged. Anyone bisecting around early April
  needs to know the revert happened.

### Neutral / follow-ups

- Components written before PR #31 still mix Tailwind and inline styling.
  Migrate opportunistically, not in a big-bang sweep.
- If a Tailwind v4 upgrade changes how its layers work, this ADR's
  cascade assumption needs re-validation.
- A future ADR should be opened if we decide to drop Tailwind entirely
  or to flip `useCSSLayers` back on.

## References

- Spec: `docs/stylex.md`
- First attempt (merged then reverted): PR [#30 stylex](https://github.com/janimattiellonen/Harkkapankki/pull/30), commits `5ff0410` (add) → `f3d2dec` (revert)
- Re-adoption: PR [#31 use-stylex](https://github.com/janimattiellonen/Harkkapankki/pull/31), commits `afd8530` (replace all buttons + `useCSSLayers: false` fix), `ef8f3b3` (token extraction)
- Code: `vite.config.ts`, `app/styles/tokens.stylex.ts`, `app/styles/constants.stylex.ts`, `app/components/Button.tsx`
- Plugin: `@stylexjs/unplugin`
