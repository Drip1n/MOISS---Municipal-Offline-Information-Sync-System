import type { Priority } from "@/types";

export function nextUpdateId(existing: { id: string }[]): string {
  const nums = existing
    .map((u) => Number(u.id.replace(/^EHV-/, "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `EHV-${String(max + 1).padStart(3, "0")}`;
}

export function reportId(): string {
  return `FR-${Date.now().toString().slice(-6)}`;
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Accepts "" (unset) or a valid 24-hour HH:MM. Rejects "banana", "25:99". */
export function isValidTime(v: string): boolean {
  if (v === "") return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

const KNOWN_CATEGORY: Record<string, string> = {
  general: "General",
  water: "Water",
  medical: "Medical",
  shelter: "Shelter",
  safety: "Safety",
  infrastructure: "Infrastructure",
};

/** Known category key → label; custom values are shown as typed. */
export function categoryLabel(c: string): string {
  return KNOWN_CATEGORY[c] ?? c;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  normal: "Normal",
  high: "High priority",
  critical: "Critical",
};
