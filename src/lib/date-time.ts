import { APP_LOCALE, APP_TIME_ZONE } from "@/lib/domain/constants";

const eventDateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const romeLongDateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  dateStyle: "long",
  timeZone: APP_TIME_ZONE,
});

const romeDateTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: APP_TIME_ZONE,
});

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatEventDate(value: string) {
  const match = dateOnlyPattern.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return eventDateFormatter.format(
    new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
  );
}

export function formatRomeLongDate(value: string | Date) {
  return romeLongDateFormatter.format(
    typeof value === "string" ? new Date(value) : value,
  );
}

export function formatRomeDateTime(value: string | Date) {
  return romeDateTimeFormatter.format(
    typeof value === "string" ? new Date(value) : value,
  );
}
