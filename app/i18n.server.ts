import { RemixI18Next } from 'remix-i18next/server';
import i18nextOptions from './i18nextOptions';
import Backend from 'i18next-fs-backend';
import { resolve } from 'node:path';
import { getDefaultLocale } from './utils/locale.server';

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18nextOptions.supportedLngs,
    fallbackLanguage: getDefaultLocale(), // Use APP_LOCALE environment variable
  },
  i18next: {
    ...i18nextOptions,
    fallbackLng: getDefaultLocale(), // Use APP_LOCALE environment variable
    backend: {
      loadPath: resolve('./public/locales/{{lng}}.json'),
    },
  },
  backend: Backend,
});
