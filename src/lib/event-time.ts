export function romeDateTimeLocalToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return "";
  const guess = new Date(`${value}:00Z`);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(guess);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const localAsUtc = Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day")), Number(get("hour")), Number(get("minute")));
  const offset = localAsUtc - guess.getTime();
  return new Date(guess.getTime() - offset).toISOString();
}
