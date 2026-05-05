import type { LinksFunction, LoaderFunctionArgs } from 'react-router';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from 'react-router';
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

  return { locale, translations };
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
        <link rel="stylesheet" href="/virtual:stylex.css" suppressHydrationWarning />
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
        {process.env.NODE_ENV === 'development' && (
          <script type="module" src="/@id/virtual:stylex:runtime" />
        )}
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

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl p-6 text-center">
          <p className="text-sm font-semibold text-blue-600">404</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Sivua ei löytynyt</h1>
          <p className="mt-2 text-gray-600">
            Etsimääsi sivua ei löytynyt. Linkki saattaa olla vanhentunut tai resurssi on poistettu.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Etusivulle
            </Link>
            <Link
              to="/seasons"
              className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Kaudet
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const message =
    isRouteErrorResponse(error) && typeof error.data === 'string'
      ? error.data
      : error instanceof Error
        ? error.message
        : 'Tapahtui odottamaton virhe.';

  const status = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm font-semibold text-red-600">{status}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Jokin meni pieleen</h1>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Etusivulle
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
