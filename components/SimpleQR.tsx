"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Bare QR image — no fallback UI. For Wi-Fi / URL onboarding QRs. */
export function SimpleQR({
  value,
  size = 200,
  label,
}: {
  value: string;
  size?: number;
  label?: string;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 3,
      width: 512,
      color: { dark: "#111111", light: "#FFFFFF" },
    })
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [value]);

  return (
    <figure className="flex flex-col items-center">
      <div className="rounded border border-ehv-grey-line bg-white p-2">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label ?? "QR code"} width={size} height={size} />
        ) : (
          <div style={{ width: size, height: size }} />
        )}
      </div>
      {label ? (
        <figcaption className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-ehv-ink/55">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
