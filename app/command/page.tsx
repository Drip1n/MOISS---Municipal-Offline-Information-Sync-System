"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AREA_PRESETS,
  CATEGORY_PRESETS,
  type CrisisUpdate,
  type FieldReport,
  type Priority,
} from "@/types";
import { RoleHeader } from "@/components/RoleHeader";
import { Footer } from "@/components/Footer";
import { DemoControls } from "@/components/DemoControls";
import { UpdateCard } from "@/components/UpdateCard";
import { QRDisplay } from "@/components/QRDisplay";
import { QRScanner } from "@/components/QRScanner";
import { VerificationBadge } from "@/components/VerificationBadge";
import { BootstrapPanel } from "@/components/BootstrapPanel";
import { useStore } from "@/components/useStore";
import {
  addCommandReport,
  getCommandReports,
  getCommandUpdates,
  saveCommandUpdate,
} from "@/lib/storage";
import { buildTransfer, readTransfer } from "@/lib/transfer";
import { makeSyncCode, pushLocal } from "@/lib/localsync";
import {
  categoryLabel,
  PRIORITY_LABEL,
  formatTime,
  isValidTime,
  nextUpdateId,
} from "@/lib/util";

const PRIORITIES: Priority[] = ["normal", "high", "critical"];
const OTHER = "__other__";

export default function CommandPage() {
  const [updates] = useStore<CrisisUpdate[]>(getCommandUpdates, []);
  const [reports] = useStore<FieldReport[]>(getCommandReports, []);
  const [transferFor, setTransferFor] = useState<string | null>(null);
  const [reportNotice, setReportNotice] = useState("");
  const [importingReport, setImportingReport] = useState(false);

  const [areaSel, setAreaSel] = useState<string>("Strijp-S");
  const [areaCustom, setAreaCustom] = useState("");
  const [catSel, setCatSel] = useState<string>("water");
  const [catCustom, setCatCustom] = useState("");
  const [priority, setPriority] = useState<Priority>("high");
  const [message, setMessage] = useState("");
  const [validUntil, setValidUntil] = useState("18:00");
  const [nextUpdate, setNextUpdate] = useState("18:00");
  const [formError, setFormError] = useState("");

  const lastCreated = updates[0]?.createdAt;

  function publish(e: React.FormEvent) {
    e.preventDefault();
    const area = areaSel === OTHER ? areaCustom.trim() : areaSel;
    const category = catSel === OTHER ? catCustom.trim() : catSel;
    if (!message.trim()) return setFormError("Message is required.");
    if (areaSel === OTHER && !area) return setFormError("Enter a custom area.");
    if (catSel === OTHER && !category)
      return setFormError("Enter a custom category.");
    if (!isValidTime(validUntil) || !isValidTime(nextUpdate))
      return setFormError("Times must be HH:MM.");

    setFormError("");
    const update: CrisisUpdate = {
      id: nextUpdateId(updates),
      createdAt: new Date().toISOString(),
      area,
      category,
      priority,
      message: message.trim(),
      validUntil,
      nextUpdate,
    };
    saveCommandUpdate(update);
    setMessage("");
    setTransferFor(update.id);
  }

  const transferUpdate = updates.find((u) => u.id === transferFor) || null;

  function importReport(raw: string) {
    const res = readTransfer(raw);
    if (!res.ok || res.kind !== "field_report" || !res.data) {
      setReportNotice(res.error || "That code is not a field report.");
      return;
    }
    if (!res.verified) {
      setReportNotice("Field report signature invalid — rejected.");
      return;
    }
    addCommandReport(res.data as FieldReport);
    setReportNotice("Field report received and verified.");
    setImportingReport(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <RoleHeader role="Command Center" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        {/* STATUS */}
        <section className="grid grid-cols-2 gap-3">
          <Stat label="Created updates" value={String(updates.length)} accent />
          <Stat
            label="Last update"
            value={lastCreated ? formatTime(lastCreated) : "—"}
          />
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
                  value={areaSel}
                  onChange={(e) => setAreaSel(e.target.value)}
                  className="input"
                >
                  {AREA_PRESETS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                  <option value={OTHER}>Other…</option>
                </select>
                {areaSel === OTHER && (
                  <input
                    value={areaCustom}
                    onChange={(e) => setAreaCustom(e.target.value)}
                    placeholder="Custom area"
                    className="input mt-2"
                    autoFocus
                  />
                )}
              </Field>
              <Field label="Category">
                <select
                  value={catSel}
                  onChange={(e) => setCatSel(e.target.value)}
                  className="input"
                >
                  {CATEGORY_PRESETS.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(c)}
                    </option>
                  ))}
                  <option value={OTHER}>Other…</option>
                </select>
                {catSel === OTHER && (
                  <input
                    value={catCustom}
                    onChange={(e) => setCatCustom(e.target.value)}
                    placeholder="Custom category"
                    className="input mt-2"
                    autoFocus
                  />
                )}
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
                  type="time"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Next expected update">
                <input
                  type="time"
                  value={nextUpdate}
                  onChange={(e) => setNextUpdate(e.target.value)}
                  className="input"
                />
              </Field>
            </div>

            {formError && (
              <p className="rounded bg-ehv-red/10 px-3 py-2 text-sm font-semibold text-ehv-red">
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded bg-ehv-red px-4 py-3 text-base font-bold text-white hover:bg-ehv-red-dark"
            >
              Publish update
            </button>
          </form>
        </section>

        {/* TRANSFER */}
        {transferUpdate && (
          <TransferPanel
            update={transferUpdate}
            onClose={() => setTransferFor(null)}
          />
        )}

        {/* CREATED UPDATES */}
        {updates.length > 0 && (
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
        )}

        {/* LOCAL TRANSFER NETWORK */}
        <BootstrapPanel networkName="MOISS-LOCAL" />

        {/* INCOMING FIELD REPORTS — secondary */}
        <details className="mt-8 rounded-lg border border-ehv-grey-line bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-ehv-ink">
            Incoming field reports ({reports.length})
          </summary>
          <div className="border-t border-ehv-grey-line p-4">
            {reportNotice && (
              <p className="mb-3 rounded bg-ehv-ink px-3 py-2 text-sm font-medium text-white">
                {reportNotice}
              </p>
            )}
            {importingReport ? (
              <div>
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
                className="rounded border border-ehv-red px-4 py-2 text-sm font-semibold text-ehv-red"
              >
                Import field report
              </button>
            )}

            {reports.length > 0 && (
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
                      <span className="font-mono text-xs text-ehv-ink/50">
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
            )}
          </div>
        </details>

        <DemoControls seed />
      </main>

      <Footer />
      <FieldStyles />
    </div>
  );
}

function TransferPanel({
  update,
  onClose,
}: {
  update: CrisisUpdate;
  onClose: () => void;
}) {
  const code = useMemo(() => buildTransfer("crisis_update", update), [update]);
  const [syncCode, setSyncCode] = useState<string | null>(null);

  useEffect(() => {
    const c = makeSyncCode();
    let alive = true;
    pushLocal(c, code).then((ok) => {
      if (alive) setSyncCode(ok ? c : null);
    });
    return () => {
      alive = false;
    };
  }, [code]);

  return (
    <section className="mt-8 rounded-lg border-2 border-ehv-red bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ehv-ink">Transfer to courier</h2>
        <button
          onClick={onClose}
          className="text-sm font-semibold text-ehv-ink/50"
        >
          Close
        </button>
      </div>
      <p className="mt-1 text-sm text-ehv-ink/60">
        Update <span className="font-mono font-bold text-ehv-ink">{update.id}</span>{" "}
        — show this to the courier device.
      </p>

      {syncCode && (
        <p className="mt-3 rounded bg-ehv-grey px-3 py-2 text-sm">
          <span className="font-semibold text-ehv-ink/60">
            Local sync code (same network):
          </span>{" "}
          <span className="font-mono text-lg font-bold tracking-widest text-ehv-red">
            {syncCode}
          </span>
        </p>
      )}

      <div className="mt-4 flex justify-center">
        <QRDisplay value={code} caption="Courier → scan / import" />
      </div>
    </section>
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
