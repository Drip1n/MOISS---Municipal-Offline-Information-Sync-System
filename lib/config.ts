/**
 * Deployment config for the local-hotspot bootstrap. All values are optional —
 * when unset the UI shows setup instructions instead of pretending a network
 * exists. Set them in `.env.local` (see `.env.example`).
 */

export interface MoissConfig {
  /** Address couriers use to reach this host, e.g. "192.168.4.1:3100". */
  localHost: string;
  /** Wi-Fi network the host laptop broadcasts / is joined to. */
  wifiSsid: string;
  wifiPassword: string;
  configured: boolean;
}

export function getConfig(): MoissConfig {
  const envHost = process.env.NEXT_PUBLIC_MOISS_LOCAL_HOST ?? "";
  const ssid = process.env.NEXT_PUBLIC_MOISS_WIFI_SSID ?? "";
  const pass = process.env.NEXT_PUBLIC_MOISS_WIFI_PASSWORD ?? "";

  // Fall back to the address this page was actually served from — correct
  // whenever a courier already reached the host to load this screen.
  const runtimeHost =
    typeof window !== "undefined" ? window.location.host : "";
  const localHost = envHost || runtimeHost;

  return {
    localHost,
    wifiSsid: ssid,
    wifiPassword: pass,
    configured: Boolean(envHost || ssid),
  };
}

/** Standard Wi-Fi QR string for a phone's normal camera. */
export function wifiQrString(ssid: string, password: string): string {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
  return `WIFI:T:WPA;S:${esc(ssid)};P:${esc(password)};;`;
}

export function courierUrl(localHost: string): string {
  const host = localHost || (typeof window !== "undefined" ? window.location.host : "");
  const proto =
    typeof window !== "undefined" ? window.location.protocol : "http:";
  return `${proto}//${host}/courier`;
}
