export function formatRwf(amount: number): string {
  return `${amount.toLocaleString("en-US")} RWF`;
}

// The due date is stored as the end of that day in UTC, so we show it in UTC
// too. Otherwise Rwanda's time zone would push it onto the next day.
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}