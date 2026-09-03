"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  CrisisUpdate,
  FieldReport,
  FieldReportType,
  Priority,
  StoredUpdate,
} from "@/types";
import { RoleHeader } from "@/components/RoleHeader";
import { Footer } from "@/components/Footer";
import { DemoControls } from "@/components/DemoControls";
import { UpdateCard } from "@/components/UpdateCard";
import { QRDisplay } from "@/components/QRDisplay";
import { QRScanner } from "@/components/QRScanner";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useStore } from "@/components/useStore";
import {
  addNcpReport,
  addNcpUpdate,
  getNcpPublished,
  getNcpReports,
  getNcpUpdates,
  setNcpPublished,
} from "@/lib/storage";
import { buildPayload, decodePayload, encodePayload } from "@/lib/transfer";
import { PRIORITY_LABEL, formatTime, reportId } from "@/lib/util";

const NCP_LOCATION = "Strijp-S";

const REPORT_TYPES: FieldReportType[] = [
  "medical",
  "water",
  "fire",
  "missing-person",
  "infrastructure",
  "other",
];
const PRIORITIES: Priority[] = ["normal", "high", "critical"];

export default function NcpPage() {
  const [updates] = useStore<StoredUpdate[]>(getNcpUpdates, []);
  const [published] = useStore<CrisisUpdate | null>(getNcpPublished, null);
  const [reports] = useStore<FieldReport[]>(getNcpReports, []);

  const [scanning, setScanning] = useState(false);
  const [lastImport, setLastImport] = useState<StoredUpdate | null>(null);
  const [notice, setNotice] = useState("");

  const [rType, setRType] = useState<FieldReportType>("medical");
  const [rPriority, setRPriority] = useState<Priority>("critical");
  const [rLocation, setRLocation] = useState("");
  const [rDesc, setRDesc] = useState("");
  const [reportQr, setReportQr] = useState<string | null>(null);

  function receive(raw: string) {
    const res = decodePayload(raw);
    if (!res.ok || !res.payload || res.payload.kind !== "crisis_update") {
      setNotice(res.error || "Not a municipal update.");
      return;
    }
    const stored: StoredUpdate = {
      payload: res.payload,
      receivedAt: new Date().toISOString(),
      deliveryStatus: "delivered",
      verified: !!res.verified,
    };
    // Only keep updates whose municipal signature checks out. An unverified
    // update is shown in the confirmation panel with a warning but never stored
    // or made publishable.
    if (stored.verified) addNcpUpdate(stored);
    setLastImport(stored);
    setScanning(false);
    setNotice("");
  }

  function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!rLocation.trim() || !rDesc.trim()) return;
    const report: FieldReport = {
      id: reportId(),
      createdAt: new Date().toISOString(),
      type: rType,
      priority: rPriority,
      location: rLocation.trim(),
      description: rDesc.trim(),
      sourceNcp: `NCP ${NCP_LOCATION}`,
    };
    addNcpReport(report);
    setReportQr(encodePayload(buildPayload("field_report", report)));
    setRLocation("");
    setRDesc("");
  }

  const importedUpdate = lastImport?.payload.data as CrisisUpdate | undefined;
  const canPublish = !!lastImport?.verified;

  return (
    <div className="flex min-h-screen flex-col">
      <RoleHeader role="Neighborhood Information Point" sub={NCP_LOCATION} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <section className="grid grid-cols-3 gap-3">
          <Stat label="Location" value={NCP_LOCATION} />
          <Stat label="System" value="Offline" accent />
          <Stat
            label="On display"
            value={published ? published.id : "None"}
          />
        </section>

        {notice ? (
          <p className="mt-4 rounded bg-ehv-red px-3 py-2 text-sm font-medium text-white">
            {notice}
          </p>
        ) : null}

        {!scanning ? (
          <button
            onClick={() => {
              setNotice("");
              setScanning(true);
            }}
            className="mt-6 w-full rounded-lg bg-ehv-red px-4 py-4 text-lg font-bold text-white hover:bg-ehv-red-dark"
          >
            Receive municipal update
          </button>
        ) : (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold">Receive from courier</h2>
              <button
                onClick={() => setScanning(false)}
                className="text-sm font-semibold text-ehv-ink/50"
              >
                Cancel
              </button>
            </div>
            <QRScanner onResult={receive} label="Receive update" />
          </div>
        )}

        {/* CONFIRMATION */}
        {lastImport && importedUpdate ? (
          <section
            className={`mt-6 rounded-lg border-2 p-5 ${
              canPublish ? "border-ehv-green" : "border-ehv-red"
            } bg-white`}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-ehv-ink/45">
              Update received
            </p>
            <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
              <span className="text-ehv-ink/55">Source</span>
              <span className="font-semibold">Municipal Command</span>
              <span className="text-ehv-ink/55">Update ID</span>
              <span className="font-semibold font-mono">
                {importedUpdate.id}
              </span>
              <span className="text-ehv-ink/55">Timestamp</span>
              <span className="font-semibold">
                {formatTime(importedUpdate.createdAt)}
              </span>
            </div>
            <div className="mt-3">
              <VerificationBadge
                verified={lastImport.verified}
                mode={lastImport.payload.mode}
              />
            </div>

            <div className="mt-4">
              <UpdateCard update={importedUpdate} compact />
            </div>

            {canPublish && published?.id === importedUpdate.id ? (
              <div className="mt-4 rounded bg-ehv-green/10 p-3 text-center">
                <p className="text-sm font-bold text-ehv-green">
                  Published to public display
                </p>
                <a
                  href="/ncp/display"
                  target="_blank"
                  rel="noopener"
                  className="mt-1 inline-block text-sm font-semibold text-ehv-red underline"
                >
                  Open public display →
                </a>
              </div>
            ) : canPublish ? (
              <button
                onClick={() => {
                  setNcpPublished(importedUpdate);
                  try {
                    window.open("/ncp/display", "_blank", "noopener");
                  } catch {
                    /* popup blocked — the link below still works */
                  }
                }}
                className="mt-4 w-full rounded bg-ehv-red px-4 py-3 text-base font-bold text-white hover:bg-ehv-red-dark"
              >
                Publish to public display
              </button>
            ) : (
              <p className="mt-4 rounded bg-ehv-red/10 px-3 py-2 text-sm font-semibold text-ehv-red">
                Signature could not be verified. Publishing is blocked.
              </p>
            )}
          </section>
        ) : null}

        {/* PUBLIC DISPLAY LINK */}
        <section className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-ehv-grey-line bg-white p-4">
          <div>
            <p className="font-bold text-ehv-ink">Public display</p>
            <p className="text-sm text-ehv-ink/60">
              {published
                ? `Showing ${published.id} — ${published.area}`
                : "Nothing published yet."}
            </p>
          </div>
          <Link
            href="/ncp/display"
            target="_blank"
            className="ml-auto rounded border border-ehv-red px-3 py-1.5 text-sm font-semibold text-ehv-red"
          >
            Open display →
          </Link>
          {published ? (
            <button
              onClick={() => setNcpPublished(null)}
              className="rounded border border-ehv-grey-line px-3 py-1.5 text-sm font-semibold text-ehv-ink/60"
            >
              Clear
            </button>
          ) : null}
        </section>

        {/* FIELD REPORT */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ehv-ink">
            Field report (send back with courier)
          </h2>
          <form
            onSubmit={submitReport}
            className="mt-3 space-y-4 rounded-lg border border-ehv-grey-line bg-white p-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ehv-ink/70">
                  Type
                </span>
                <select
                  value={rType}
                  onChange={(e) =>
                    setRType(e.target.value as FieldReportType)
                  }
                  className="ncp-input"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ehv-ink/70">
                  Priority
                </span>
                <select
                  value={rPriority}
                  onChange={(e) => setRPriority(e.target.value as Priority)}
                  className="ncp-input"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ehv-ink/70">
                Location
              </span>
              <input
                value={rLocation}
                onChange={(e) => setRLocation(e.target.value)}
                placeholder="Boschdijk 123"
                className="ncp-input"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ehv-ink/70">
                Description
              </span>
              <textarea
                value={rDesc}
                onChange={(e) => setRDesc(e.target.value)}
                rows={2}
                placeholder="Medical assistance required."
                className="ncp-input resize-none"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full rounded bg-ehv-ink px-4 py-3 font-bold text-white"
            >
              Create field report
            </button>
          </form>

          {reportQr ? (
            <div className="mt-4 rounded-lg border-2 border-ehv-ink bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Courier pickup</h3>
                <button
                  onClick={() => setReportQr(null)}
                  className="text-sm font-semibold text-ehv-ink/50"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 flex justify-center">
                <QRDisplay value={reportQr} caption="Courier → import on return trip" />
              </div>
            </div>
          ) : null}

          {reports.length ? (
            <ul className="mt-4 space-y-2 text-sm">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="rounded border border-ehv-grey-line bg-white p-3"
                >
                  <span className="font-mono text-xs text-ehv-ink/50">
                    {r.id}
                  </span>{" "}
                  <span className="font-semibold capitalize">
                    {r.type.replace("-", " ")}
                  </span>{" "}
                  — {r.location} ({PRIORITY_LABEL[r.priority]})
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* RECEIVED HISTORY */}
        {updates.length ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-ehv-ink">Received updates</h2>
            <div className="mt-3 space-y-3">
              {updates.map((s) => {
                const u = s.payload.data as CrisisUpdate;
                return (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <UpdateCard update={u} receivedAt={s.receivedAt} compact />
                    </div>
                    <button
                      onClick={() => setNcpPublished(u)}
                      className="shrink-0 rounded border border-ehv-red px-3 py-1.5 text-sm font-semibold text-ehv-red"
                    >
                      Display
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <DemoControls />
      </main>

      <Footer />
      <style>{`
        .ncp-input {
          width: 100%;
          border: 1px solid #D4D4D8;
          border-radius: 0.375rem;
          padding: 0.5rem 0.625rem;
          font-size: 0.95rem;
          background: #fff;
        }
        .ncp-input:focus { outline: 2px solid #E41613; outline-offset: 1px; }
      `}</style>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-ehv-grey-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-ehv-ink/45">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-bold ${accent ? "text-ehv-red" : "text-ehv-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}
