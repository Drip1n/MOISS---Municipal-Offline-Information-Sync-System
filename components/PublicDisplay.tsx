import type { CrisisUpdate } from "@/types";
import { categoryLabel, PRIORITY_LABEL, formatTime } from "@/lib/util";
import { Brand } from "./Brand";

/**
 * Citizen-facing crisis board. Minimal — readable from several metres away.
 * No operator / implementation detail on this screen.
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
      <div className="flex items-center justify-between border-b-4 border-ehv-red px-10 py-6">
        <Brand height={40} />
        <span className="text-lg font-bold uppercase tracking-widest text-ehv-ink/50">
          Neighbourhood Information Point · {location}
        </span>
      </div>

      {update ? (
        <main className="flex flex-1 flex-col items-center justify-center px-10 py-12 text-center">
          <p className="text-2xl font-bold uppercase tracking-[0.25em] text-ehv-ink/45">
            Official crisis information
          </p>

          {update.priority !== "normal" && (
            <p className="mt-6 inline-block rounded-lg bg-ehv-red px-6 py-2 text-2xl font-extrabold uppercase tracking-wide text-white">
              {PRIORITY_LABEL[update.priority]}
            </p>
          )}

          <h1 className="mt-8 text-6xl font-black uppercase tracking-tight text-ehv-ink sm:text-7xl">
            {categoryLabel(update.category)}
          </h1>

          <p className="mt-8 max-w-4xl text-4xl font-semibold leading-tight text-ehv-ink sm:text-5xl">
            {update.message}
          </p>

          <p className="mt-8 text-3xl font-bold text-ehv-red">
            {update.area}
            {update.validUntil ? ` · until ${update.validUntil}` : ""}
          </p>

          <p className="mt-14 text-lg text-ehv-ink/50">
            Verified municipal update · {formatTime(update.createdAt)}
            {update.nextUpdate ? ` · next update ${update.nextUpdate}` : ""}
          </p>
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center justify-center px-10 text-center">
          <p className="text-4xl font-bold text-ehv-ink/40">
            No update published yet
          </p>
        </main>
      )}
    </div>
  );
}
