"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Re-render when local storage changes (this tab via `moiss:change`, or another
 * tab via the native `storage` event).
 *
 * The first render always returns `initial` — the same value the server renders —
 * so hydration never mismatches. Real storage is read in an effect right after
 * mount.
 */
export function useStore<T>(selector: () => T, initial: T): [T, () => void] {
  const [value, setValue] = useState<T>(initial);

  const refresh = useCallback(() => setValue(selector()), [selector]);

  useEffect(() => {
    refresh();
    window.addEventListener("moiss:change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("moiss:change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return [value, refresh];
}
