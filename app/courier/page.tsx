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
import { buildPayload, decodePayload, encodePayload } from "@/lib/transfer";
import { CATEGORY_LABEL, PRIORITY_LABEL, formatTime } from "@/lib/util";

export default function CourierPage() {
  const [stored] = useStore<StoredUpdate[]>(getCourierUpdates, []);
  const [mode, setMode] = useState<"list" | "receive">("list");
  const [showQrFor, setShowQrFor] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");

  const pending = stored.filter((s) => s.deliveryStatus === "pending");
  const delivered = stored.filter((s) => s.deliveryStatus === "delivered");

  function receive(raw: string) {
    const res = decodePayload(raw);
    if (!res.ok || !res.payload || res.payload.kind !== "crisis_update") {
      setNotice(res.error || "Not a municipal update.");
      return;
    }
    addCourierUpdate({
      payload: res.payload,
      receivedAt: new Date().toISOString(),
      deliveryStatus: "pending",
      verified: !!res.verified,
    });
    setNotice("Update stored. Carry it to the NCP.");
    setMode("list");
  }

  const qrTarget = stored.find(
    (s) => (s.payload.data as CrisisUpdate).id === showQrFor
  );
  const qrCode = useMemo(
    () =>
      qrTarget
        ? encodePayload(
            buildPayload("crisis_update", qrTarget.payload.data as CrisisUpdate)
          )
        : "",
    [qrTarget]
  );

  return (
    <div className="flex min-h-screen flex-col bg-ehv-grey">
      <RoleHeader role="Courier" sub="Offline ready" />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        {notice ? (
          <p className="mb-4 rounded bg-ehv-ink px-3 py-2 text-sm font-medium text-white">
            {notice}
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini label="Stored" value={stored.length} />
          <Mini label="Pending" value={pending.length} accent />
          <Mini label="Delivered" value={delivered.length} />
        </div>

        {mode === "list" ? (
          <button
            onClick={() => {
              setNotice("");
              setMode("receive");
            }}
            className="mt-5 w-full rounded-lg bg-ehv-red px-4 py-4 text-lg font-bold text-white"
          >
            Receive update
          </button>
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

        {showQrFor && qrTarget ? (
          <section className="mt-6 rounded-lg border-2 border-ehv-red bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Transfer to NCP</h2>
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
                markCourierUpdateDelivered(
                  (qrTarget.payload.data as CrisisUpdate).id
                );
                setShowQrFor(null);
                setNotice("Marked as delivered.");
              }}
              className="mt-3 w-full rounded bg-ehv-ink px-4 py-2.5 font-semibold text-white"
            >
              Mark as delivered
            </button>
          </section>
        ) : null}

        <div className="mt-6 space-y-4">
          {stored.length === 0 ? (
            <p className="text-center text-sm text-ehv-ink/50">
              No updates carried yet.
            </p>
          ) : null}

          {stored.map((s) => {
            const u = s.payload.data as CrisisUpdate;
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
                    {CATEGORY_LABEL[u.category]}
                  </span>
                  <span className="ml-auto text-xs font-mono text-ehv-ink/45">
                    {u.id}
                  </span>
                </div>

                <p className="mt-2 text-base font-semibold">{u.area}</p>
                <p className="text-ehv-ink">{u.message}</p>
                <p className="mt-1 text-xs text-ehv-ink/55">
                  Received {formatTime(s.receivedAt)}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <VerificationBadge
                    verified={s.verified}
                    mode={s.payload.mode}
                  />
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

                {s.deliveryStatus === "pending" ? (
                  <button
                    onClick={() => setShowQrFor(u.id)}
                    className="mt-3 w-full rounded bg-ehv-red px-4 py-2.5 font-semibold text-white"
                  >
                    Show transfer QR
                  </button>
                ) : null}
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
