"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleHeader } from "@/components/RoleHeader";
import { Footer } from "@/components/Footer";
import { useStore } from "@/components/useStore";
import { COMMAND_PUBLIC_KEY } from "@/lib/verification";
import {
  getCommandUpdates,
  getCourierUpdates,
  getNcpPublished,
  getNcpUpdates,
} from "@/lib/storage";

export default function AboutPage() {
  const [cmd] = useStore(getCommandUpdates, []);
  const [courier] = useStore(getCourierUpdates, []);
  const [ncp] = useStore(getNcpUpdates, []);
  const [published] = useStore(getNcpPublished, null);

  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <RoleHeader role="System status" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <section className="rounded-lg border border-ehv-grey-line bg-white p-5">
          <h2 className="text-lg font-bold">Transport chain</h2>
          <ol className="mt-3 space-y-2 text-sm text-ehv-ink/80">
            <li>1 · Command creates &amp; signs an update</li>
            <li>2 · Courier scans the QR / transfer code and stores it offline</li>
            <li>3 · Courier physically travels to the NCP</li>
            <li>4 · NCP scans the courier&apos;s QR and verifies the signature</li>
            <li>5 · NCP publishes it to the public display</li>
          </ol>
          <p className="mt-3 text-sm text-ehv-ink/60">
            No step uses the internet or a server. The courier is the transport
            layer.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Browser network"
            value={online === null ? "—" : online ? "Online" : "Offline"}
          />
          <Stat label="Command updates" value={cmd.length} />
          <Stat label="Courier carrying" value={courier.length} />
          <Stat label="NCP received" value={ncp.length} />
        </section>

        <section className="mt-6 rounded-lg border border-ehv-grey-line bg-white p-5">
          <h2 className="text-lg font-bold">Verification</h2>
          <p className="mt-2 text-sm text-ehv-ink/70">
            Updates are signed with Ed25519. Command holds the private key; every
            NCP embeds this public key:
          </p>
          <code className="mt-2 block break-all rounded bg-ehv-grey p-2 font-mono text-xs">
            {COMMAND_PUBLIC_KEY}
          </code>
          <p className="mt-2 text-sm text-ehv-ink/60">
            On display now: {published ? published.id : "nothing"}.
          </p>
        </section>

        <div className="mt-8 flex gap-3">
          <Link
            href="/command"
            className="rounded bg-ehv-red px-4 py-2 text-sm font-semibold text-white"
          >
            Command
          </Link>
          <Link
            href="/courier"
            className="rounded border border-ehv-grey-line px-4 py-2 text-sm font-semibold"
          >
            Courier
          </Link>
          <Link
            href="/ncp"
            className="rounded border border-ehv-grey-line px-4 py-2 text-sm font-semibold"
          >
            NCP
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-ehv-grey-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-ehv-ink/45">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-ehv-ink">{value}</p>
    </div>
  );
}
