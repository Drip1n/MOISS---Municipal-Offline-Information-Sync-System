<p align="center">
  <img src="public/branding/logo-eindhoven.png" alt="Gemeente Eindhoven" height="56">
</p>

<h1 align="center">MOISS</h1>

<p align="center"><strong>No internet. No cellular. Verified information still moves.</strong></p>

MOISS keeps verified municipal crisis information moving during a prolonged
blackout. A courier physically carries signed updates between disconnected
locations — Command → Courier → NCP → citizens.

## Quick start

```bash
git clone https://github.com/Drip1n/MOISS---Municipal-Offline-Information-Sync-System.git
cd MOISS---Municipal-Offline-Information-Sync-System
npm install
npm run build
npm start          # http://localhost:3100
```

| Route          | Device      |
|----------------|-------------|
| `/command`     | Laptop A — create updates |
| `/courier`     | Smartphone — carry updates |
| `/ncp`         | Laptop B — verify & publish |
| `/ncp/display` | Monitor — citizen-facing board |

## 60-second demo

1. **Command** → `Load demo update (EHV-004)` → `Generate transfer QR`.
2. **Courier** → `Receive update` → scan the QR (or `Paste`). Shows **EHV-004 ✓ Verified**.
3. **Courier** → walk to Laptop B → `Show transfer QR`.
4. **NCP** → `Receive municipal update` → scan it → **Verified municipal update**.
5. **NCP** → `Publish to public display`.
6. `/ncp/display` updates instantly — with Wi-Fi off the whole time.

## How it works

```
Command ──signed update──▶ Courier ──physical transport──▶ NCP ──▶ Citizens
```

- **Local hotspot** — bootstrap + fast sync (a laptop hosts MOISS on a local network)
- **Data QR** — universal fallback, needs no network at all
- **Transfer code** — last-resort paste fallback

## Courier bootstrap

A courier arriving with their own phone and no app:

1. Join the local MOISS Wi-Fi (scan the Wi-Fi QR on Command / NCP).
2. Scan the second QR to open the locally hosted Courier screen.
3. Receive the update — it is now stored on the phone.

Set `NEXT_PUBLIC_MOISS_LOCAL_HOST` / `_WIFI_SSID` / `_WIFI_PASSWORD` (see
`.env.example`); unset, the panel shows setup steps instead of faking a network.

## Verification

Updates are signed with Ed25519. Every NCP is provisioned with the municipality
public key before a crisis, so the key never travels in the transfer. A tampered
message fails verification and cannot be stored, carried, or published.

## Two-way reporting

An NCP can send a signed field report back to Command on the courier's return
trip, using the same transfer mechanism. It is a collapsed secondary panel.

## Offline behavior

After the first load a service worker serves every route from cache, so all
screens work with no connection. The connectivity chip shows **Online**,
**Local only**, or **Offline** — MOISS transport is operational in all three.

## Project structure

```
app/         command · courier · ncp · ncp/display · about · api/transfer
components/  RoleHeader · QRDisplay · QRScanner · PublicDisplay · BootstrapPanel …
lib/         transfer (codec) · verification · connectivity · storage · localsync · config
```

## Disclaimer

Hackathon prototype — not an official Gemeente Eindhoven system.
