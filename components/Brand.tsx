/* eslint-disable @next/next/no-img-element */

/**
 * Official Gemeente Eindhoven logo asset (`public/branding/logo-eindhoven.png`),
 * used unmodified for this hackathon demo. The persistent footer disclaimer
 * makes clear this is not an official municipality system.
 */
export function Brand({
  className = "",
  height = 28,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <img
      src="/branding/logo-eindhoven.png"
      alt="Gemeente Eindhoven"
      height={height}
      style={{ height }}
      className={`w-auto ${className}`}
    />
  );
}
