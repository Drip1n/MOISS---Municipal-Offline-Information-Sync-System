"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Renders a transfer code as a QR image plus a copy-paste fallback, so the
 * demo never depends on a working camera at the receiving end.
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
    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: { dark: "#1A1A1A", light: "#FFFFFF" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [value]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="rounded-lg border border-ehv-grey-line bg-white p-3">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Transfer QR code"
            width={320}
            height={320}
            className="h-auto w-[min(320px,72vw)]"
          />
        ) : (
          <div className="flex h-[min(320px,72vw)] w-[min(320px,72vw)] items-center justify-center text-sm text-ehv-ink/40">
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
