/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createInstance, type Resource } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { getInitialNamespaces } from 'remix-i18next/client';
import i18nextOptions from './i18nextOptions';

type I18nData = {
  locale?: string;
  translations?: Resource;
};

declare global {
  interface Window {
    __i18nData?: I18nData;
  }
}

async function hydrate() {
  // Get translations from the script tag injected by the server
  const i18nData = window.__i18nData || {};
  const locale = i18nData.locale || document.documentElement.lang || 'fi';
  const translations = i18nData.translations || {};

  const i18n = createInstance();

  await i18n.use(initReactI18next).init({
    ...i18nextOptions,
    lng: locale,
    ns: getInitialNamespaces(),
    resources: translations,
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
