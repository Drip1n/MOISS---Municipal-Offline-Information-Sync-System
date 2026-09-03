"use client";

import { useConnectivity } from "@/lib/connectivity";

const LABEL = {
  checking: "Checking…",
  online: "Online",
  "local-only": "Local only",
  offline: "Offline",
} as const;

/** Compact, calm connectivity chip. Shown in every operator header. */
export function ConnectivityStatus({ className = "" }: { className?: string }) {
  const state = useConnectivity();
  const dot =
    state === "online"
      ? "bg-ehv-green"
      : state === "checking"
        ? "bg-ehv-ink/30"
        : "bg-ehv-ink/50";

  return (
    <div className={`text-right ${className}`}>
      <span className="inline-flex items-center gap-2 rounded-full border border-ehv-grey-line bg-ehv-grey px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ehv-ink/70">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {LABEL[state]}
      </span>
      {(state === "local-only" || state === "offline") && (
        <p className="mt-1 text-[11px] font-medium text-ehv-ink/45">
          MOISS transport remains operational.
        </p>
      )}
    </div>
  );
}
