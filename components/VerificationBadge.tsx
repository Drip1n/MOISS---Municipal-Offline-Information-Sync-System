import type { TransferPayload } from "@/types";

export function VerificationBadge({
  verified,
  mode,
  label,
}: {
  verified: boolean;
  mode?: TransferPayload["mode"];
  label?: string;
}) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-2 rounded bg-ehv-green/10 px-3 py-1.5 text-sm font-semibold text-ehv-green">
        <CheckIcon />
        {label ??
          (mode === "prototype"
            ? "Prototype verification"
            : "Verified municipal update")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded bg-ehv-red/10 px-3 py-1.5 text-sm font-semibold text-ehv-red">
      <WarnIcon />
      Signature invalid — do not publish
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M13 4.5 6.5 11 3 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5 15 14H1L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 6v3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.6" r="0.9" fill="currentColor" />
    </svg>
  );
}
