import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(relativeTime);
dayjs.extend(isoWeek);

export { dayjs };

export function nowISO(): string {
  return dayjs().toISOString();
}

export function formatDate(iso?: string, template = "MMM D, YYYY"): string {
  if (!iso) return "—";
  return dayjs(iso).format(template);
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  return dayjs(iso).startOf("day").diff(dayjs().startOf("day"), "day");
}

export function relative(iso?: string): string {
  if (!iso) return "—";
  return dayjs(iso).fromNow();
}
