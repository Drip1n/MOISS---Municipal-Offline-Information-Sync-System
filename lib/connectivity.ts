"use client";

import { useEffect, useState } from "react";

export type Connectivity = "online" | "local-only" | "offline" | "checking";

/**
 * Real connectivity detection — never trusts `navigator.onLine` alone
 * (it reports `true` on a hotspot with no internet).
 *
 *   offline     no usable network interface
 *   local-only  interface up, but external internet probe failed
 *   online      external probe succeeded
 *
 * The probe is a fast, timed, no-cors request. It never blocks the UI and MOISS
 * transport does not depend on its result.
 */
async function probeInternet(timeoutMs = 2500): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch("https://www.gstatic.com/generate_204", {
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true; // resolved (opaque) → reachable
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function useConnectivity(): Connectivity {
  const [state, setState] = useState<Connectivity>("checking");

  useEffect(() => {
    let alive = true;

    const check = async () => {
      if (!navigator.onLine) {
        if (alive) setState("offline");
        return;
      }
      const ok = await probeInternet();
      if (alive) setState(ok ? "online" : "local-only");
    };

    check();
    const onNet = () => check();
    window.addEventListener("online", onNet);
    window.addEventListener("offline", onNet);
    const interval = setInterval(check, 20000);

    return () => {
      alive = false;
      window.removeEventListener("online", onNet);
      window.removeEventListener("offline", onNet);
      clearInterval(interval);
    };
  }, []);

  return state;
}
