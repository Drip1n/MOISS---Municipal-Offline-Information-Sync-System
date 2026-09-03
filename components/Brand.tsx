/**
 * Placeholder municipal mark.
 *
 * This is intentionally NOT the official Gemeente Eindhoven logo. The real asset
 * should be dropped in at `public/gemeente-eindhoven-logo.svg` and rendered here
 * once its use has been cleared. Until then we show a neutral typographic mark
 * so nothing on screen can be mistaken for an official municipality logo.
 */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="inline-block h-7 w-7 rounded-sm border-2 border-ehv-red"
      />
      <span className="text-sm font-semibold uppercase tracking-wide text-ehv-ink">
        Gemeente Eindhoven
        <span className="ml-1.5 font-normal normal-case tracking-normal text-ehv-ink/50">
          (placeholder)
        </span>
      </span>
    </div>
  );
}
