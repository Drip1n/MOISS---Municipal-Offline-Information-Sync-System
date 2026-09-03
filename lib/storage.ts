import type { CrisisUpdate, FieldReport, StoredUpdate } from "@/types";

/**
 * All persistence is local to the browser (localStorage). No network, no server.
 * Each role keeps its own slice of state under a namespaced key.
 */

const KEYS = {
  commandUpdates: "moiss.command.updates",
  commandReports: "moiss.command.reports",
  courierUpdates: "moiss.courier.updates",
  courierReports: "moiss.courier.reports",
  ncpUpdates: "moiss.ncp.updates",
  ncpPublished: "moiss.ncp.published",
  ncpReports: "moiss.ncp.reports",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("moiss:change"));
}

/* ---------------- Command ---------------- */

export const getCommandUpdates = () =>
  read<CrisisUpdate[]>(KEYS.commandUpdates, []);

export function saveCommandUpdate(update: CrisisUpdate) {
  const list = getCommandUpdates();
  write(KEYS.commandUpdates, [update, ...list]);
}

export const getCommandReports = () =>
  read<FieldReport[]>(KEYS.commandReports, []);

export function addCommandReport(report: FieldReport) {
  const list = getCommandReports();
  if (list.some((r) => r.id === report.id)) return;
  write(KEYS.commandReports, [report, ...list]);
}

/* ---------------- Courier ---------------- */

export const getCourierUpdates = () =>
  read<StoredUpdate[]>(KEYS.courierUpdates, []);

export function addCourierUpdate(stored: StoredUpdate) {
  const list = getCourierUpdates();
  const data = stored.payload.data as CrisisUpdate;
  if (list.some((s) => (s.payload.data as CrisisUpdate).id === data.id)) return;
  write(KEYS.courierUpdates, [stored, ...list]);
}

export function markCourierUpdateDelivered(id: string) {
  const list = getCourierUpdates().map((s) =>
    (s.payload.data as CrisisUpdate).id === id
      ? { ...s, deliveryStatus: "delivered" as const }
      : s
  );
  write(KEYS.courierUpdates, list);
}

export const getCourierReports = () =>
  read<FieldReport[]>(KEYS.courierReports, []);

export function addCourierReport(report: FieldReport) {
  const list = getCourierReports();
  if (list.some((r) => r.id === report.id)) return;
  write(KEYS.courierReports, [report, ...list]);
}

/* ---------------- NCP ---------------- */

export const getNcpUpdates = () => read<StoredUpdate[]>(KEYS.ncpUpdates, []);

export function addNcpUpdate(stored: StoredUpdate) {
  const list = getNcpUpdates();
  const data = stored.payload.data as CrisisUpdate;
  if (list.some((s) => (s.payload.data as CrisisUpdate).id === data.id)) return;
  write(KEYS.ncpUpdates, [stored, ...list]);
}

export const getNcpPublished = () =>
  read<CrisisUpdate | null>(KEYS.ncpPublished, null);

export function setNcpPublished(update: CrisisUpdate | null) {
  write(KEYS.ncpPublished, update);
}

export const getNcpReports = () => read<FieldReport[]>(KEYS.ncpReports, []);

export function addNcpReport(report: FieldReport) {
  const list = getNcpReports();
  write(KEYS.ncpReports, [report, ...list]);
}

/* ---------------- Demo control ---------------- */

export function resetAll() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  window.dispatchEvent(new Event("moiss:change"));
}
