# i18n Usage Guide

## Overview

This application uses remix-i18next with react-i18next for internationalization. Currently supports Finnish (fi) and English (en).

**Implementation**: Translations are loaded inline (passed from server to client via the root loader) for optimal performance and no additional HTTP requests.

## Configuration

The default language is set via the `APP_LOCALE` environment variable in `.env`:
```
APP_LOCALE="fi"
```

## Translation Files

Translation files are located in `public/locales/`:
- `public/locales/fi.json` - Finnish translations
- `public/locales/en.json` - English translations

These files are read server-side and passed to the client inline, eliminating the need for HTTP requests.

## Usage in Components

### Basic Usage

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### With Variables

```tsx
const { t } = useTranslation();

// Translation: "Duration: {{minutes}} minutes"
<p>{t('exercises.durationLabel', { minutes: 30 })}</p>
```

### Language Switcher

Use the `LanguageSwitcher` component to allow users to change language:

```tsx
import LanguageSwitcher from '~/components/LanguageSwitcher';

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### Accessing Current Language

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language; // 'fi' or 'en'

  return <div>Current language: {currentLanguage}</div>;
}
```

## Usage in Loaders (Server-side)

```tsx
import { json } from '@remix-run/node';
import { i18next } from '~/i18n.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(request);
  const title = t('exercises.title');

  return json({ title });
}
```

## Adding New Translations

1. Add the translation key and value to both `public/locales/fi.json` and `public/locales/en.json`
2. Use the translation in your component with `t('your.translation.key')`

Example:
```json
// fi.json
{
  "myFeature": {
    "title": "Ominaisuus",
    "description": "Kuvaus"
  }
}

// en.json
{
  "myFeature": {
    "title": "Feature",
    "description": "Description"
  }
}
```

## Available Translation Keys

See the full list of translation keys in:
- `public/locales/fi.json`
- `public/locales/en.json`

Current namespaces:
- `navigation` - Navigation menu items
- `exercises` - Exercise-related translations
- `sessions` - Practice session translations
- `common` - Common UI elements (buttons, labels, etc.)
- `form` - Form validation messages
