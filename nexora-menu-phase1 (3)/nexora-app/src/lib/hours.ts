import type { WorkingHours } from "@/components/restaurant-profile/working-hours-editor";

const DAY_KEYS: (keyof WorkingHours)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Returns "Open now" / "Closed" (or null if no hours are configured), based on the restaurant's own timezone-naive local hours. */
export function getOpenStatusLabel(hours: unknown): string | null {
  if (!hours || typeof hours !== "object") return null;
  const wh = hours as WorkingHours;

  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const today = wh[dayKey];
  if (!today) return null;
  if (today.closed) return "Closed today";

  const [openH, openM] = (today.open ?? "00:00").split(":").map(Number);
  const [closeH, closeM] = (today.close ?? "23:59").split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const minutesOpen = openH * 60 + openM;
  const minutesClose = closeH * 60 + closeM;

  return minutesNow >= minutesOpen && minutesNow <= minutesClose ? "Open now" : "Closed";
}
