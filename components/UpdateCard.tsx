import type { CrisisUpdate } from "@/types";
import { CATEGORY_LABEL, PRIORITY_LABEL, formatTime } from "@/lib/util";

const PRIORITY_STYLE: Record<CrisisUpdate["priority"], string> = {
  normal: "bg-ehv-grey text-ehv-ink/70 border-ehv-grey-line",
  high: "bg-ehv-red/10 text-ehv-red border-ehv-red/30",
  critical: "bg-ehv-red text-white border-ehv-red",
};

export function UpdateCard({
  update,
  receivedAt,
  status,
  compact = false,
}: {
  update: CrisisUpdate;
  receivedAt?: string;
  status?: string;
  compact?: boolean;
}) {
  return (
    <article className="rounded-lg border border-ehv-grey-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${PRIORITY_STYLE[update.priority]}`}
        >
          {PRIORITY_LABEL[update.priority]}
        </span>
        <span className="rounded border border-ehv-grey-line bg-ehv-grey px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-ehv-ink/70">
          {CATEGORY_LABEL[update.category]}
        </span>
        <span className="ml-auto text-xs font-mono text-ehv-ink/50">
          {update.id}
        </span>
      </div>

      <p className="mt-3 text-lg font-semibold text-ehv-ink">{update.area}</p>
      <p
        className={`mt-1 text-ehv-ink ${compact ? "text-base" : "text-xl leading-snug"}`}
      >
        {update.message}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-ehv-ink/50">Valid until</dt>
          <dd className="font-semibold">{update.validUntil || "—"}</dd>
        </div>
        <div>
          <dt className="text-ehv-ink/50">Next update</dt>
          <dd className="font-semibold">{update.nextUpdate || "—"}</dd>
        </div>
        <div>
          <dt className="text-ehv-ink/50">Created</dt>
          <dd className="font-semibold">{formatTime(update.createdAt)}</dd>
        </div>
        {receivedAt ? (
          <div>
            <dt className="text-ehv-ink/50">Received</dt>
            <dd className="font-semibold">{formatTime(receivedAt)}</dd>
          </div>
        ) : null}
      </dl>

      {status ? (
        <p className="mt-4 inline-flex rounded bg-ehv-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          {status}
        </p>
      ) : null}
    </article>
  );
}
