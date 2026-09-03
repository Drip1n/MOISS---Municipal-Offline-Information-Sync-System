import Link from "next/link";
import { Brand } from "./Brand";
import { ConnectivityStatus } from "./ConnectivityStatus";

/**
 * Every operator screen opens with the same three answers:
 * WHERE AM I (role) · WHAT IS THE STATUS (connectivity) · what is this (MOISS).
 */
export function RoleHeader({ role, sub }: { role: string; sub?: string }) {
  return (
    <header className="border-b border-ehv-grey-line bg-white">
      <div className="mx-auto flex max-w-3xl items-start justify-between gap-4 px-5 py-3">
        <Link href="/" className="hover:opacity-80" aria-label="MOISS home">
          <Brand />
        </Link>
        <ConnectivityStatus />
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
