/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getInitialNamespaces } from 'remix-i18next/client';
import i18nextOptions from './i18nextOptions';

async function hydrate() {
  // Get the initial data from the root loader
  const initialData = window.__remixContext?.state?.loaderData?.root;
  const locale = initialData?.locale || 'fi';
  const translations = initialData?.translations || {};

  const i18n = createInstance();

  await i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...i18nextOptions,
      lng: locale,
      ns: getInitialNamespaces(),
      resources: {
        [locale]: {
          translation: translations,
        },
      },
      detection: {
        order: ['htmlTag'],
        caches: [],
      },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18n}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  window.setTimeout(hydrate, 1);
}
