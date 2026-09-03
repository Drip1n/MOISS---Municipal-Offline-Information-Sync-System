import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Footer } from "@/components/Footer";
import { OfflinePill } from "@/components/RoleHeader";

const ROLES = [
  {
    href: "/command",
    title: "Command Center",
    who: "Laptop A",
    desc: "Municipal coordinator creates verified crisis updates.",
  },
  {
    href: "/courier",
    title: "Courier",
    who: "Smartphone",
    desc: "Physically carries updates between disconnected locations.",
  },
  {
    href: "/ncp",
    title: "Neighborhood Point",
    who: "Laptop B",
    desc: "Receives updates and shows them on a public display.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ehv-grey-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Brand />
          <OfflinePill />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-ehv-red">
            MOISS
          </h1>
          <p className="text-sm text-ehv-ink/60">
            Municipal Offline Information Sync System
          </p>
        </div>
        <p className="mt-4 max-w-xl text-lg text-ehv-ink/80">
          During a prolonged blackout, a courier becomes the network. Updates
          travel <span className="font-semibold">Command → Courier → NCP</span>{" "}
          with no internet or cellular connection.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group rounded-lg border border-ehv-grey-line bg-white p-5 transition hover:border-ehv-red hover:shadow-md"
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

        <Link
          href="/about"
          className="mt-8 inline-block text-sm font-semibold text-ehv-red"
        >
          System status & how it works →
        </Link>
      </main>

      <Footer />
    </div>
  );
}
