export function getDefaultLocale(): string {
  return process.env.APP_LOCALE || 'fi';
}
