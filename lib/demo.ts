import type { CrisisUpdate } from "@/types";
import { saveCommandUpdate, getCommandUpdates } from "./storage";

export const DEMO_UPDATE: CrisisUpdate = {
  id: "EHV-004",
  createdAt: new Date().toISOString(),
  area: "Strijp-S",
  category: "water",
  priority: "high",
  message: "Drinking water is available at Area 51, Strijp-S. Bring your own containers.",
  validUntil: "18:00",
  nextUpdate: "18:00",
};

/** Seed a single ready-to-transfer update at Command for a fast demo. */
export function seedDemo() {
  if (getCommandUpdates().some((u) => u.id === DEMO_UPDATE.id)) return;
  saveCommandUpdate({ ...DEMO_UPDATE, createdAt: new Date().toISOString() });
}
