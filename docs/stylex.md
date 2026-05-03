# Stylex

My plan is to start converting tailwind styles to stylex styles.

First step is to install and configure stylex.

For installation, read https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-installation.md

Next step is to select a small component and convert it to use stylex so that we can verify Stylex works as
expected. I suggest you use /Users/janimattiellonen/Documents/Development/Frisbeegolf/Harkkapankki/app/components/PractiseSessionSummary.tsx.

Instructions on how to properly use Stylex can be found at https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md

I'm comparing your stylex setup against another React Router 7 setup.

Here are some differences:

package.json:

Us:
"@stylexjs/unplugin": "^0.18.2",

Them:
"vite-plugin-stylex": "^0.13.0",

vite.config.ts:

Us:

```
import { vite as stylexVite } from '@stylexjs/unplugin';
...
  plugins: [
    stylexVite({
      useCSSLayers: true,
    }),
    reactRouter(),
    tsconfigPaths(),
  ],

```

Them:

```
import stylex from "vite-plugin-stylex";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const stylexPlugin = stylex({
  aliases: {
    "~/*": [path.resolve(__dirname, "app", "*")],
  },
});

// biome-ignore lint/style/noDefaultExport: Vite needs default export.
export default defineConfig({
  plugins: [reactRouter(), stylexPlugin],
  resolve: {
    tsconfigPaths: true,
  },
});

```

## Button component

Replace <button> in /Users/janimattiellonen/Documents/Development/Frisbeegolf/Harkkapankki/app/pages/EditExercisePage.tsx
with a Button component (app/components/Button.tsx). In addition to that, style the new button component using Stylex.

Create common variants such as primary and secondary.

Replace all instances of <button>'s in this project with the new component

## Theme

Create a stylex token file with that contains generally used values like:

- borderRadius
- padding
- fontSize
- fontWeight
- colors

### Colors

Never use specific colors directly in code. Create semantical color params that are then used.

For example (as an example, color names in the example isn't a must):

```
export const theme = defineVars({
  // Text
  textPrimary: color.ink90,
  textMuted: color.ink60,
  textAccent: color.indigo50,
  textDanger: color.red50,

  // Border
  border: color.ink30,
  borderHover: color.ink40,
  // Button
  buttonPrimaryColor: color.neutral100,
  buttonPrimaryBackground: color.indigo50,
  buttonPrimaryBackgroundHover: color.indigo40,
  buttonPrimaryBackgroundActive: color.indigo60,
  buttonPrimaryOutline: color.indigo50,

  buttonSecondaryColor: color.ink90,
  buttonSecondaryBackground: color.ink10,
  buttonSecondaryBackgroundHover: color.ink20,
  buttonSecondaryBorder: color.ink60,
  buttonSecondaryOutline: color.ink60,

```
