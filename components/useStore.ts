"use client";

import { useCallback, useEffect, useState } from "react";
import { channel } from "@/lib/storage";

/**
 * Re-render when local storage changes — same document (`moiss:change`), other
 * windows (`BroadcastChannel`), or other tabs (`storage`).
 *
 * First render always returns `initial` (matches the server) so hydration never
 * mismatches; real storage is read in an effect right after mount.
 */
export function useStore<T>(selector: () => T, initial: T): [T, () => void] {
  const [value, setValue] = useState<T>(initial);
  const refresh = useCallback(() => setValue(selector()), [selector]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("moiss:change", onChange);
    window.addEventListener("storage", onChange);
    channel?.addEventListener("message", onChange);
    return () => {
      window.removeEventListener("moiss:change", onChange);
      window.removeEventListener("storage", onChange);
      channel?.removeEventListener("message", onChange);
    };
  }, [refresh]);

  return [value, refresh];
}
