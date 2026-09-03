import type { Category, Priority } from "@/types";

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

export const CATEGORY_LABEL: Record<Category, string> = {
  general: "General",
  water: "Water",
  medical: "Medical",
  shelter: "Shelter",
  safety: "Safety",
  infrastructure: "Infrastructure",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  normal: "Normal",
  high: "High priority",
  critical: "Critical",
};
