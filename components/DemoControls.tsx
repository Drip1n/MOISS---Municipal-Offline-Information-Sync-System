"use client";

import { useState } from "react";
import { seedDemo } from "@/lib/demo";
import { getCommandUpdates, resetAll } from "@/lib/storage";

/**
 * Reset the demo from any screen; seed the demo update from Command only
 * (seeding writes to Command's store, so it has no visible effect elsewhere).
 */
export function DemoControls({ seed = false }: { seed?: boolean }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div className="mt-10 rounded-lg border border-dashed border-ehv-grey-line bg-ehv-grey p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-ehv-ink/45">
          Demo
        </span>
        {seed ? (
          <button
            type="button"
            onClick={() => {
              const existed = getCommandUpdates().some((u) => u.id === "EHV-004");
              seedDemo();
              setNote(existed ? "EHV-004 already loaded." : "Loaded EHV-004.");
              setTimeout(() => setNote(""), 2500);
            }}
            className="rounded border border-ehv-grey-line bg-white px-3 py-1.5 text-sm font-semibold text-ehv-ink"
          >
            Load demo update (EHV-004)
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (confirmReset) {
              resetAll();
              setConfirmReset(false);
              setNote("Demo reset.");
              setTimeout(() => setNote(""), 2500);
            } else {
              setConfirmReset(true);
              setTimeout(() => setConfirmReset(false), 3000);
            }
          }}
          className="rounded border border-ehv-grey-line bg-white px-3 py-1.5 text-sm font-semibold text-ehv-red"
        >
          {confirmReset ? "Tap again to confirm" : "Reset demo"}
        </button>
        {note ? (
          <span className="text-sm font-medium text-ehv-ink/60">{note}</span>
        ) : null}
      </div>
    </div>
  );
}
