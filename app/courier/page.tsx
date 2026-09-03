"use client";

import { useMemo, useState } from "react";
import type { CrisisUpdate, StoredUpdate } from "@/types";
import { RoleHeader } from "@/components/RoleHeader";
import { Footer } from "@/components/Footer";
import { DemoControls } from "@/components/DemoControls";
import { QRDisplay } from "@/components/QRDisplay";
import { QRScanner } from "@/components/QRScanner";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useStore } from "@/components/useStore";
import {
  addCourierUpdate,
  getCourierUpdates,
  markCourierUpdateDelivered,
} from "@/lib/storage";
import { buildTransfer, readTransfer } from "@/lib/transfer";
import { pullLocal } from "@/lib/localsync";
import { categoryLabel, PRIORITY_LABEL, formatTime } from "@/lib/util";

export default function CourierPage() {
  const [stored] = useStore<StoredUpdate[]>(getCourierUpdates, []);
  const [mode, setMode] = useState<"list" | "receive">("list");
  const [showQrFor, setShowQrFor] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [rejected, setRejected] = useState(false);
  const [justReceived, setJustReceived] = useState<CrisisUpdate | null>(null);
  const [syncInput, setSyncInput] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);

  const pending = stored.filter((s) => s.deliveryStatus === "pending");
  const delivered = stored.filter((s) => s.deliveryStatus === "delivered");

  function receive(raw: string) {
    setRejected(false);
    const res = readTransfer(raw);
    if (!res.ok || res.kind !== "crisis_update" || !res.data) {
      setNotice(res.error || "Not a municipal update.");
      return;
    }
    // Defence-in-depth: a courier never stores or carries an unverified update.
    if (!res.verified) {
      setRejected(true);
      setNotice("");
      setMode("list");
      return;
    }
    const data = res.data as CrisisUpdate;
    addCourierUpdate({
      data,
      receivedAt: new Date().toISOString(),
      deliveryStatus: "pending",
      verified: true,
    });
    setJustReceived(data);
    setNotice("");
    setMode("list");
  }

  async function tryLocalSync() {
    const code = syncInput.trim().toUpperCase();
    if (code.length < 4) return;
    setSyncBusy(true);
    const transfer = await pullLocal(code);
    setSyncBusy(false);
    if (!transfer) {
      setNotice("No transfer for that code. Use the QR instead.");
      return;
    }
    setSyncInput("");
    receive(transfer);
  }

  const qrTarget = stored.find((s) => s.data.id === showQrFor);
  const qrCode = useMemo(
    () => (qrTarget ? buildTransfer("crisis_update", qrTarget.data) : ""),
    [qrTarget]
  );

  return (
    <div className="flex min-h-screen flex-col bg-ehv-grey">
      <RoleHeader role="Courier" />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        {notice && (
          <p className="mb-4 rounded bg-ehv-ink px-3 py-2 text-sm font-medium text-white">
            {notice}
          </p>
        )}

        {rejected && (
          <div className="mb-4 rounded-lg border-2 border-ehv-red bg-white p-4">
            <p className="text-sm font-extrabold uppercase tracking-wide text-ehv-red">
              Invalid municipal signature
            </p>
            <p className="mt-1 text-sm text-ehv-ink/70">
              Transfer rejected — not stored, not carried.
            </p>
          </div>
        )}

        {justReceived && (
          <div className="mb-4 rounded-lg border-2 border-ehv-green bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-ehv-ink/45">
              Update received
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-ehv-ink">
              {justReceived.id}
            </p>
            <div className="mt-2">
              <VerificationBadge verified />
            </div>
            <p className="mt-2 text-sm text-ehv-ink/70">
              {categoryLabel(justReceived.category)} · {justReceived.area} —
              ready for delivery.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini label="Stored" value={stored.length} />
          <Mini label="Pending" value={pending.length} accent />
          <Mini label="Delivered" value={delivered.length} />
        </div>

        {mode === "list" ? (
          <>
            <button
              onClick={() => {
                setNotice("");
                setRejected(false);
                setJustReceived(null);
                setMode("receive");
              }}
              className="mt-5 w-full rounded-lg bg-ehv-red px-4 py-4 text-lg font-bold text-white"
            >
              Receive update
            </button>
            <div className="mt-3 flex gap-2">
              <input
                value={syncInput}
                onChange={(e) => setSyncInput(e.target.value.toUpperCase())}
                placeholder="Local sync code"
                maxLength={8}
                className="flex-1 rounded border border-ehv-grey-line bg-white px-3 py-2 font-mono text-sm uppercase tracking-widest"
              />
              <button
                onClick={tryLocalSync}
                disabled={syncBusy || syncInput.trim().length < 4}
                className="rounded border border-ehv-red px-4 py-2 text-sm font-semibold text-ehv-red disabled:opacity-40"
              >
                {syncBusy ? "…" : "Get"}
              </button>
            </div>
            <p className="mt-1 text-center text-[11px] text-ehv-ink/45">
              On the same network as Command? Enter the code shown there.
            </p>
          </>
        ) : (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold">Receive from Command</h2>
              <button
                onClick={() => setMode("list")}
                className="text-sm font-semibold text-ehv-ink/50"
              >
                Cancel
              </button>
            </div>
            <QRScanner onResult={receive} />
          </div>
        )}

        {showQrFor && qrTarget && (
          <section className="mt-6 rounded-lg border-2 border-ehv-red bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">
                Transfer{" "}
                <span className="font-mono text-ehv-red">{qrTarget.data.id}</span>{" "}
                to NCP
              </h2>
              <button
                onClick={() => setShowQrFor(null)}
                className="text-sm font-semibold text-ehv-ink/50"
              >
                Close
              </button>
            </div>
            <div className="mt-3 flex justify-center">
              <QRDisplay value={qrCode} caption="NCP → scan / import" />
            </div>
            <button
              onClick={() => {
                markCourierUpdateDelivered(qrTarget.data.id);
                setShowQrFor(null);
                setNotice("Marked as delivered.");
              }}
              className="mt-3 w-full rounded bg-ehv-ink px-4 py-2.5 font-semibold text-white"
            >
              Mark as delivered
            </button>
          </section>
        )}

        <div className="mt-6 space-y-4">
          {stored.length === 0 && (
            <p className="text-center text-sm text-ehv-ink/50">
              No updates carried yet.
            </p>
          )}

          {stored.map((s) => {
            const u = s.data;
            return (
              <article
                key={u.id}
                className="rounded-lg border border-ehv-grey-line bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                      u.priority === "normal"
                        ? "bg-ehv-grey text-ehv-ink/70"
                        : "bg-ehv-red text-white"
                    }`}
                  >
                    {PRIORITY_LABEL[u.priority]}
                  </span>
                  <span className="text-xs font-bold uppercase text-ehv-ink/60">
                    {categoryLabel(u.category)}
                  </span>
                  <span className="ml-auto font-mono text-xs font-bold text-ehv-ink">
                    {u.id}
                  </span>
                </div>

                <p className="mt-2 text-base font-semibold">{u.area}</p>
                <p className="text-ehv-ink">{u.message}</p>
                <p className="mt-1 text-xs text-ehv-ink/55">
                  Received {formatTime(s.receivedAt)}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <VerificationBadge verified={s.verified} />
                  <span
                    className={`text-xs font-bold uppercase ${
                      s.deliveryStatus === "delivered"
                        ? "text-ehv-green"
                        : "text-ehv-ink/50"
                    }`}
                  >
                    {s.deliveryStatus === "delivered"
                      ? "Delivered"
                      : "Ready for delivery"}
                  </span>
                </div>

                {s.deliveryStatus === "pending" && (
                  <button
                    onClick={() => setShowQrFor(u.id)}
                    className="mt-3 w-full rounded bg-ehv-red px-4 py-2.5 font-semibold text-white"
                  >
                    Show transfer QR
                  </button>
                )}
              </article>
            );
          })}
        </div>

        <DemoControls />
      </main>

      <Footer />
    </div>
  );
}

function Mini({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-ehv-grey-line bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ehv-ink/45">
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${accent ? "text-ehv-red" : "text-ehv-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}
