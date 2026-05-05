import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';

export const HELSINKI_TIMEZONE = 'Europe/Helsinki';

export function helsinkiWallClockToUtc(dateString: string, timeString: string): Date {
  const wallClock = `${dateString}T${timeString}:00`;
  return fromZonedTime(wallClock, HELSINKI_TIMEZONE);
}

export function utcToHelsinkiDateString(value: Date): string {
  return format(toZonedTime(value, HELSINKI_TIMEZONE), 'yyyy-MM-dd', {
    timeZone: HELSINKI_TIMEZONE,
  });
}

export function utcToHelsinkiTimeString(value: Date): string {
  return format(toZonedTime(value, HELSINKI_TIMEZONE), 'HH:mm', {
    timeZone: HELSINKI_TIMEZONE,
  });
}
