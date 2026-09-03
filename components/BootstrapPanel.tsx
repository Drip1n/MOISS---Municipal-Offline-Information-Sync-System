"use client";

import { useState } from "react";
import { getConfig, wifiQrString, courierUrl } from "@/lib/config";
import { SimpleQR } from "./SimpleQR";

/**
 * LOCAL TRANSFER NETWORK panel + courier onboarding.
 *
 * A browser cannot switch on the OS hotspot — so this guides a non-technical
 * operator instead of faking connectivity. Collapsed by default.
 */
export function BootstrapPanel({ networkName }: { networkName: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"setup" | "onboarding">("onboarding");
  const cfg = getConfig();
  const url = courierUrl(cfg.localHost);

  return (
    <section className="mt-8 rounded-lg border border-ehv-grey-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span>
          <span className="text-sm font-bold text-ehv-ink">
            Local transfer network
          </span>
          <span className="ml-2 text-xs font-medium text-ehv-ink/50">
            {cfg.configured ? "Configured" : "Not configured"} · bootstrap + fast sync
          </span>
        </span>
        <span className="text-sm font-semibold text-ehv-red">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open ? (
        <div className="border-t border-ehv-grey-line p-4">
          <dl className="grid grid-cols-[7rem_1fr] gap-y-1 text-sm">
            <dt className="text-ehv-ink/55">Network</dt>
            <dd className="font-mono font-semibold">
              {cfg.wifiSsid || networkName}
            </dd>
            <dt className="text-ehv-ink/55">Local app</dt>
            <dd className="font-mono font-semibold break-all">{url}</dd>
          </dl>

          <div className="mt-3 flex gap-2 rounded bg-ehv-grey p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setView("onboarding")}
              className={`flex-1 rounded px-3 py-1.5 ${view === "onboarding" ? "bg-white shadow-sm" : "text-ehv-ink/55"}`}
            >
              Courier onboarding
            </button>
            <button
              type="button"
              onClick={() => setView("setup")}
              className={`flex-1 rounded px-3 py-1.5 ${view === "setup" ? "bg-white shadow-sm" : "text-ehv-ink/55"}`}
            >
              Network setup
            </button>
          </div>

          {view === "onboarding" ? (
            <div className="mt-4">
              <ol className="space-y-1 text-sm font-semibold text-ehv-ink">
                <li>1 · Join local MOISS network</li>
                <li>2 · Open Courier app</li>
                <li>3 · Receive update</li>
              </ol>
              {cfg.wifiSsid ? (
                <div className="mt-4 flex flex-wrap justify-center gap-8">
                  <SimpleQR
                    value={wifiQrString(cfg.wifiSsid, cfg.wifiPassword)}
                    label="1 · Join network (phone camera)"
                  />
                  <SimpleQR value={url} label="2 · Open Courier app" />
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <SimpleQR value={url} label="Open Courier app" />
                  <p className="max-w-sm text-center text-xs text-ehv-ink/55">
                    Wi-Fi QR not configured. Have the courier join the network
                    manually, then scan this to open the Courier app.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <ol className="mt-4 space-y-2 text-sm text-ehv-ink/80">
              <li>
                1 · On this laptop, start a Wi-Fi hotspot (or connect all devices
                to one offline router).
              </li>
              <li>
                2 · Set <code className="rounded bg-ehv-grey px-1">NEXT_PUBLIC_MOISS_LOCAL_HOST</code>,
                {" "}
                <code className="rounded bg-ehv-grey px-1">NEXT_PUBLIC_MOISS_WIFI_SSID</code>,
                {" "}
                <code className="rounded bg-ehv-grey px-1">NEXT_PUBLIC_MOISS_WIFI_PASSWORD</code>{" "}
                in <code className="rounded bg-ehv-grey px-1">.env.local</code>,
                then rebuild.
              </li>
              <li>3 · Couriers scan the onboarding QRs — no MOISS install needed.</li>
            </ol>
          )}
        </div>
      ) : null}
    </section>
  );
}
