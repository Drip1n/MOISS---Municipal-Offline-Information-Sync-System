import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Footer } from "@/components/Footer";
import { ConnectivityStatus } from "@/components/ConnectivityStatus";

const ROLES = [
  {
    href: "/command",
    title: "Command Center",
    who: "Laptop A",
    desc: "Create verified crisis updates.",
  },
  {
    href: "/courier",
    title: "Courier",
    who: "Smartphone",
    desc: "Carry updates between disconnected locations.",
  },
  {
    href: "/ncp",
    title: "Neighborhood Point",
    who: "Laptop B",
    desc: "Receive, verify and display updates.",
  },
];

const FLOW = ["Command", "Courier", "NCP", "Public"];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ehv-grey-line">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4 px-5 py-3">
          <Brand />
          <ConnectivityStatus />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-ehv-red">MOISS</h1>
        <p className="mt-1 text-base text-ehv-ink/60">
          Municipal Offline Information Sync System
        </p>
        <p className="mt-6 text-2xl font-semibold leading-snug text-ehv-ink">
          No internet. No cellular.
          <br />
          Verified information still moves.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-wide text-ehv-ink">
          {FLOW.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className={
                  i === FLOW.length - 1
                    ? "rounded bg-ehv-red px-2.5 py-1 text-white"
                    : "rounded bg-ehv-grey px-2.5 py-1"
                }
              >
                {step}
              </span>
              {i < FLOW.length - 1 && (
                <span className="text-ehv-ink/30">→</span>
              )}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group rounded-lg border border-ehv-grey-line bg-white p-5 transition hover:border-ehv-red"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-ehv-ink/45">
                {r.who}
              </p>
              <p className="mt-1 text-lg font-bold text-ehv-ink group-hover:text-ehv-red">
                {r.title}
              </p>
              <p className="mt-2 text-sm text-ehv-ink/65">{r.desc}</p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-ehv-ink/55">
          Courier arriving with no app? A Command / NCP laptop hosts MOISS on a
          local hotspot — scan to join and open the Courier screen.
        </p>

        <Link
          href="/about"
          className="mt-4 inline-block text-sm font-semibold text-ehv-red"
        >
          System status &amp; how it works →
        </Link>
      </main>

      <Footer />
    </div>
  );
}
