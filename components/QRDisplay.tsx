"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Renders a transfer code as a large, crisp QR plus a copy-paste fallback, so a
 * laptop webcam can read a phone screen from normal demo distance and the demo
 * never depends on a working camera.
 */
export function QRDisplay({
  value,
  caption,
}: {
  value: string;
  caption?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Lower error-correction as payload grows keeps the module grid coarse
    // enough for a webcam; short codes get sturdier correction.
    const ecc = value.length > 600 ? "L" : value.length > 350 ? "M" : "Q";
    QRCode.toDataURL(value, {
      errorCorrectionLevel: ecc,
      margin: 4, // quiet zone
      width: 1024, // render high-res; CSS caps the display size, never upscales
      color: { dark: "#111111", light: "#FFFFFF" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [value]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="rounded-lg border border-ehv-grey-line bg-white p-4">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Transfer QR code"
            className="block h-auto w-[min(460px,82vw)]"
          />
        ) : (
          <div className="flex h-[min(460px,82vw)] w-[min(460px,82vw)] items-center justify-center text-sm text-ehv-ink/40">
            Generating…
          </div>
        )}
      </div>
      {caption ? (
        <p className="text-sm font-medium text-ehv-ink/60">{caption}</p>
      ) : null}

      <details className="w-full max-w-md">
        <summary className="cursor-pointer text-sm font-semibold text-ehv-red">
          No camera? Use transfer code
        </summary>
        <textarea
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-2 h-28 w-full resize-none rounded border border-ehv-grey-line bg-ehv-grey p-2 font-mono text-xs text-ehv-ink/80"
        />
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* selection fallback already available */
            }
          }}
          className="mt-2 rounded bg-ehv-ink px-3 py-1.5 text-sm font-semibold text-white"
        >
          {copied ? "Copied" : "Copy transfer code"}
        </button>
      </details>
    </div>
  );
}
