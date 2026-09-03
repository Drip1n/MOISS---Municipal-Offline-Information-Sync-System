import type { CrisisUpdate } from "@/types";
import { CATEGORY_LABEL, PRIORITY_LABEL, formatTime } from "@/lib/util";
import { Brand } from "./Brand";

/**
 * Citizen-facing crisis board. Designed to be legible from several metres away
 * on a laptop or external monitor — minimal text, very large type.
 */
export function PublicDisplay({
  update,
  location = "Strijp-S",
}: {
  update: CrisisUpdate | null;
  location?: string;
}) {
  return (
    <div className="display-shell flex min-h-screen flex-col bg-white">
      <div className="flex items-center justify-between border-b-4 border-ehv-red px-8 py-5">
        <Brand />
        <span className="text-lg font-bold uppercase tracking-widest text-ehv-ink/60">
          Offline information point
        </span>
      </div>

      {update ? (
        <main className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
          <p className="text-2xl font-bold uppercase tracking-[0.2em] text-ehv-ink/50">
            Official crisis information
          </p>

          <p
            className={`mt-6 inline-block rounded-lg px-6 py-2 text-3xl font-extrabold uppercase tracking-wide ${
              update.priority === "normal"
                ? "bg-ehv-grey text-ehv-ink/70"
                : "bg-ehv-red text-white"
            }`}
          >
            {PRIORITY_LABEL[update.priority]}
          </p>

          <h1 className="mt-8 text-6xl font-black uppercase tracking-tight text-ehv-ink sm:text-7xl">
            {CATEGORY_LABEL[update.category]}
          </h1>

          <p className="mt-8 max-w-4xl text-4xl font-semibold leading-tight text-ehv-ink sm:text-5xl">
            {update.message}
          </p>

          <p className="mt-6 text-3xl font-bold text-ehv-red">
            {update.area}
            {update.validUntil ? ` · until ${update.validUntil}` : ""}
          </p>

          <div className="mt-14 grid grid-cols-2 gap-x-16 gap-y-2 text-xl text-ehv-ink/60">
            <span>Last verified update</span>
            <span className="font-bold text-ehv-ink">
              {formatTime(update.createdAt)}
            </span>
            <span>Next expected update</span>
            <span className="font-bold text-ehv-ink">
              {update.nextUpdate || "—"}
            </span>
          </div>
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="text-4xl font-bold text-ehv-ink/40">
            No update published yet
          </p>
          <p className="mt-4 text-xl text-ehv-ink/40">
            Waiting for the next municipal courier.
          </p>
        </main>
      )}

      <div className="flex items-center justify-between border-t border-ehv-grey-line px-8 py-4 text-lg font-semibold uppercase tracking-widest text-ehv-ink/50">
        <span>NCP {location}</span>
        <span>No internet · courier-delivered</span>
      </div>
    </div>
  );
}
