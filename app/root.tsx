import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import tailwindStyles from './styles/tailwind.css?url';
import { useChangeLanguage } from 'remix-i18next/react';
import { i18next } from './i18n.server';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AppLayout from './components/Layout';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindStyles },
  { rel: 'stylesheet', href: 'https://uiwjs.github.io/react-md-editor/markdown-editor.css' },
  { rel: 'stylesheet', href: 'https://uiwjs.github.io/react-markdown-preview/markdown.css' },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);

  // Load translations from file
  const translationPath = resolve(`./public/locales/${locale}.json`);
  const translationContent = await readFile(translationPath, 'utf-8');
  const translationData = JSON.parse(translationContent);

  // Structure for i18next resources format
  const translations = {
    [locale]: {
      translation: translationData,
    },
  };

  return json({ locale, translations });
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Try to get loader data, but provide fallback for error pages
  let locale = 'fi';
  let translations = {};
  try {
    const loaderData = useLoaderData<typeof loader>();
    locale = loaderData?.locale ?? 'fi';
    translations = loaderData?.translations ?? {};
  } catch {
    // useLoaderData might not be available in error boundaries
    locale = 'fi';
  }

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__i18nData = ${JSON.stringify({ locale, translations })};`,
          }}
        />
      </head>
      <body data-color-mode="light">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
