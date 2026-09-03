export type Area =
  | "City-wide"
  | "Strijp-S"
  | "Centrum"
  | "Woensel"
  | "Tongelre";

export type Category =
  | "general"
  | "water"
  | "medical"
  | "shelter"
  | "safety"
  | "infrastructure";

export type Priority = "normal" | "high" | "critical";

export interface CrisisUpdate {
  id: string;
  createdAt: string; // ISO timestamp
  area: Area;
  category: Category;
  priority: Priority;
  message: string;
  validUntil: string; // free text, e.g. "18:00"
  nextUpdate: string; // free text, e.g. "18:00"
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
  createdAt: string; // ISO timestamp
  type: FieldReportType;
  priority: Priority;
  location: string;
  description: string;
  sourceNcp: string; // e.g. "NCP Strijp-S"
}

export type TransferKind = "crisis_update" | "field_report";

export interface TransferPayload {
  v: 1;
  kind: TransferKind;
  data: CrisisUpdate | FieldReport;
  sig: string; // base64 Ed25519 signature over canonical JSON of `data`
  pub: string; // hex public key of signer (for display)
  mode: "signed" | "prototype";
}

/** How a stored update moves through the courier pipeline. */
export type DeliveryStatus = "pending" | "delivered";

export interface StoredUpdate {
  payload: TransferPayload;
  receivedAt: string;
  deliveryStatus: DeliveryStatus;
  verified: boolean;
}
