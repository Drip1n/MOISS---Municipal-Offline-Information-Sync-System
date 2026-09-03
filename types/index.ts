export type Priority = "normal" | "high" | "critical";

/** Preset areas offered in the Command form. "Other" opens a free-text field. */
export const AREA_PRESETS = [
  "City-wide",
  "Strijp-S",
  "Centrum",
  "Woensel",
  "Tongelre",
] as const;

/** Known category keys. "Other" opens a free-text field. */
export const CATEGORY_PRESETS = [
  "general",
  "water",
  "medical",
  "shelter",
  "safety",
  "infrastructure",
] as const;

/**
 * Internal / domain object — kept readable. `area` and `category` are free
 * strings so custom values transport as-is; presets are just common choices.
 */
export interface CrisisUpdate {
  id: string;
  createdAt: string; // ISO timestamp
  area: string;
  category: string;
  priority: Priority;
  message: string;
  validUntil: string; // "HH:MM" or ""
  nextUpdate: string; // "HH:MM" or ""
}

export type FieldReportType =
  | "medical"
  | "water"
  | "fire"
  | "missing-person"
  | "infrastructure"
  | "other";

export interface FieldReport {
  id: string;
  createdAt: string;
  type: FieldReportType;
  priority: Priority;
  location: string;
  description: string;
  sourceNcp: string;
}

export type TransferKind = "crisis_update" | "field_report";

/** A crisis update stored on a device after a verified transfer. */
export interface StoredUpdate {
  data: CrisisUpdate;
  receivedAt: string;
  deliveryStatus: "pending" | "delivered";
  verified: boolean;
}
