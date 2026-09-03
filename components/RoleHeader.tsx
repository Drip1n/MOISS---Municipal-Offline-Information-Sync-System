import Link from "next/link";
import { Brand } from "./Brand";

/**
 * Every operator screen opens with the same three answers:
 * WHERE AM I (role) · WHAT IS THE STATUS (offline) · plus the system name.
 */
export function RoleHeader({
  role,
  sub,
}: {
  role: string;
  sub?: string;
}) {
  return (
    <header className="border-b border-ehv-grey-line bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <Link href="/" className="hover:opacity-80">
          <Brand />
        </Link>
        <OfflinePill />
      </div>
      <div className="mx-auto max-w-3xl px-5 pb-5 pt-1">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold tracking-tight text-ehv-red">
            MOISS
          </span>
          <span className="text-sm text-ehv-ink/60">
            Municipal Offline Information Sync System
          </span>
        </div>
        <div className="mt-2 inline-flex items-center rounded bg-ehv-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          {role}
        </div>
        {sub ? (
          <span className="ml-2 text-sm font-medium text-ehv-ink/70">{sub}</span>
        ) : null}
      </div>
    </header>
  );
}

export function OfflinePill() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-ehv-grey-line bg-ehv-grey px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ehv-ink/70"
      title="No internet required for message transport."
    >
      <span className="h-2 w-2 rounded-full bg-ehv-ink/50" />
      Offline mode
    </span>
  );
}
