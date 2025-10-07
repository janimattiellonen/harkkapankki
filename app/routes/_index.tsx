// app/routes/_index.tsx
import type { MetaFunction } from '@remix-run/node';
import HomePage from '~/pages/HomePage';

export const meta: MetaFunction = () => {
  return [{ title: 'Harkkapankki - Disc Golf Training Program' }];
};

export default function Index() {
  return <HomePage />;
}
