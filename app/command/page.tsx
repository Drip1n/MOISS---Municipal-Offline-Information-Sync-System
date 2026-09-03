"use client";

import { useMemo, useState } from "react";
import type {
  Area,
  Category,
  CrisisUpdate,
  FieldReport,
  Priority,
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
  addCommandReport,
  getCommandReports,
  getCommandUpdates,
  saveCommandUpdate,
} from "@/lib/storage";
import { buildPayload, decodePayload, encodePayload } from "@/lib/transfer";
import { CATEGORY_LABEL, PRIORITY_LABEL, formatTime, nextUpdateId } from "@/lib/util";

const AREAS: Area[] = ["City-wide", "Strijp-S", "Centrum", "Woensel", "Tongelre"];
const CATEGORIES: Category[] = [
  "general",
  "water",
  "medical",
  "shelter",
  "safety",
  "infrastructure",
];
const PRIORITIES: Priority[] = ["normal", "high", "critical"];

export default function CommandPage() {
  const [updates] = useStore<CrisisUpdate[]>(getCommandUpdates, []);
  const [reports] = useStore<FieldReport[]>(getCommandReports, []);
  const [transferFor, setTransferFor] = useState<string | null>(null);
  const [reportNotice, setReportNotice] = useState<string>("");
  const [importingReport, setImportingReport] = useState(false);

  const [area, setArea] = useState<Area>("Strijp-S");
  const [category, setCategory] = useState<Category>("water");
  const [priority, setPriority] = useState<Priority>("high");
  const [message, setMessage] = useState("");
  const [validUntil, setValidUntil] = useState("18:00");
  const [nextUpdate, setNextUpdate] = useState("18:00");

  const lastCreated = updates[0]?.createdAt;

  function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    const update: CrisisUpdate = {
      id: nextUpdateId(updates),
      createdAt: new Date().toISOString(),
      area,
      category,
      priority,
      message: message.trim(),
      validUntil: validUntil.trim(),
      nextUpdate: nextUpdate.trim(),
    };
    saveCommandUpdate(update);
    setMessage("");
    setTransferFor(update.id);
  }

  const transferUpdate = updates.find((u) => u.id === transferFor) || null;
  const transferCode = useMemo(
    () =>
      transferUpdate
        ? encodePayload(buildPayload("crisis_update", transferUpdate))
        : "",
    [transferUpdate]
  );

  function importReport(raw: string) {
    const res = decodePayload(raw);
    if (!res.ok || !res.payload || res.payload.kind !== "field_report") {
      setReportNotice(res.error || "That code is not a field report.");
      return;
    }
    if (!res.verified) {
      setReportNotice("Field report signature invalid — rejected.");
      return;
    }
    addCommandReport(res.payload.data as FieldReport);
    setReportNotice("Field report received and verified.");
    setImportingReport(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <RoleHeader role="Command Center" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        {/* STATUS */}
        <section className="grid grid-cols-3 gap-3">
          <Stat label="Network" value="Offline" accent />
          <Stat
            label="Last update"
            value={lastCreated ? formatTime(lastCreated) : "—"}
          />
          <Stat label="Pending transfers" value={String(updates.length)} />
        </section>

        {/* CREATE */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-ehv-ink">Create crisis update</h2>
          <form
            onSubmit={publish}
            className="mt-4 space-y-4 rounded-lg border border-ehv-grey-line bg-white p-5"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Area">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as Area)}
                  className="input"
                >
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="input"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Message">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Drinking water is available at Area 51, Strijp-S."
                className="input resize-none"
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valid until">
                <input
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="input"
                  placeholder="18:00"
                />
              </Field>
              <Field label="Next expected update">
                <input
                  value={nextUpdate}
                  onChange={(e) => setNextUpdate(e.target.value)}
                  className="input"
                  placeholder="18:00"
                />
              </Field>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-ehv-red px-4 py-3 text-base font-bold text-white hover:bg-ehv-red-dark"
            >
              Publish update
            </button>
          </form>
        </section>

        {/* TRANSFER */}
        {transferUpdate ? (
          <section className="mt-8 rounded-lg border-2 border-ehv-red bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ehv-ink">
                Transfer to courier
              </h2>
              <button
                onClick={() => setTransferFor(null)}
                className="text-sm font-semibold text-ehv-ink/50"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-ehv-ink/60">
              Update {transferUpdate.id} · show this to the courier device.
            </p>
            <div className="mt-4 flex justify-center">
              <QRDisplay value={transferCode} caption="Courier → scan / import" />
            </div>
          </section>
        ) : null}

        {/* CREATED UPDATES */}
        {updates.length ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-ehv-ink">Created updates</h2>
            <div className="mt-4 space-y-4">
              {updates.map((u) => (
                <div key={u.id} className="space-y-2">
                  <UpdateCard update={u} compact />
                  <button
                    onClick={() => setTransferFor(u.id)}
                    className="rounded border border-ehv-red px-3 py-1.5 text-sm font-semibold text-ehv-red"
                  >
                    Generate transfer QR
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* INCOMING FIELD REPORTS */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ehv-ink">Field reports (return trip)</h2>
          {reportNotice ? (
            <p className="mt-3 rounded bg-ehv-ink px-3 py-2 text-sm font-medium text-white">
              {reportNotice}
            </p>
          ) : null}
          {importingReport ? (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold">Import from courier</h3>
                <button
                  type="button"
                  onClick={() => setImportingReport(false)}
                  className="text-sm font-semibold text-ehv-ink/50"
                >
                  Cancel
                </button>
              </div>
              <QRScanner onResult={importReport} label="Import field report" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setReportNotice("");
                setImportingReport(true);
              }}
              className="mt-3 rounded border border-ehv-red px-4 py-2.5 text-sm font-semibold text-ehv-red"
            >
              Import field report
            </button>
          )}
          {reports.length ? (
            <div className="mt-4 space-y-3">
              {reports.map((r) => (
                <article
                  key={r.id}
                  className="rounded-lg border border-ehv-grey-line bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                        r.priority === "normal"
                          ? "bg-ehv-grey text-ehv-ink/70"
                          : "bg-ehv-red text-white"
                      }`}
                    >
                      {PRIORITY_LABEL[r.priority]}
                    </span>
                    <span className="text-xs font-mono text-ehv-ink/50">
                      {r.id}
                    </span>
                    <VerificationBadge verified label="Verified field report" />
                  </div>
                  <p className="mt-2 text-lg font-semibold capitalize">
                    {r.type.replace("-", " ")}
                  </p>
                  <p className="text-ehv-ink">{r.description}</p>
                  <p className="mt-1 text-sm text-ehv-ink/60">
                    {r.location} · {r.sourceNcp} · {formatTime(r.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-ehv-ink/50">
              None received yet.
            </p>
          )}
        </section>

        <DemoControls seed />
      </main>

      <Footer />
      <FieldStyles />
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ehv-ink/70">
        {label}
      </span>
      {children}
    </label>
  );
}

function FieldStyles() {
  return (
    <style>{`
      .input {
        width: 100%;
        border: 1px solid #D4D4D8;
        border-radius: 0.375rem;
        padding: 0.5rem 0.625rem;
        font-size: 0.95rem;
        background: #fff;
      }
      .input:focus { outline: 2px solid #E41613; outline-offset: 1px; }
    `}</style>
  );
}
