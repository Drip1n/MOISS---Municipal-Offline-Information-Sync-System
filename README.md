# MOISS — Municipal Offline Information Sync System

A civic-resilience prototype for a **72-hour prolonged power outage** in Eindhoven.

When internet and cellular networks are down, MOISS moves verified municipal
crisis updates between disconnected locations. A **courier on foot or bicycle
becomes the transport layer**:

```
Municipal Command  →  Courier smartphone  →  Neighborhood Information Point (NCP)  →  Public display
     (Laptop A)          (physically moves)            (Laptop B)                     (fullscreen)
```

Every hop transfers a QR code (or a pasted transfer code). No server, no
internet, no cellular — after the first page load the whole workflow is offline.

> Hackathon prototype — **not** an official Gemeente Eindhoven system.

## Tech

Next.js (App Router) · TypeScript · Tailwind · `localStorage` · Ed25519 signing
(`@noble/ed25519`) · `qrcode` + `jsQR` · minimal service worker for offline.

## Run

```bash
npm install
npm run build
npm start          # http://localhost:3000  (add PORT=3100 if 3000 is taken)
```

`npm run dev` also works. The service worker (offline cache) is only active in
the `build` + `start` production run.

## Routes

| Route          | Device      | Purpose                                    |
|----------------|-------------|--------------------------------------------|
| `/`            | any         | Role picker                                |
| `/command`     | Laptop A    | Create & sign crisis updates               |
| `/courier`     | Smartphone  | Receive, carry, hand off updates           |
| `/ncp`         | Laptop B    | Receive, verify, publish; file field reports|
| `/ncp/display` | Monitor     | Fullscreen public crisis board             |
| `/about`       | any         | System status & transport-chain overview   |

## 60-second demo

Setup: on Laptop B open **two** tabs — `/ncp` (operator) and `/ncp/display`
(the public screen / projector). The display updates itself the moment the
operator publishes.

1. **Command** (Laptop A, `/command`) — click **Load demo update (EHV-004)**,
   then **Generate transfer QR**.
2. **Courier** (phone, `/courier`) — **Receive update** → scan the QR (or open
   **Paste** and paste the transfer code). Card shows **Verified municipal
   update / Ready for delivery**. Walk the phone to Laptop B.
3. **Courier** — **Show transfer QR**. **NCP** (Laptop B, `/ncp`) — **Receive
   municipal update** → scan it. Confirmation panel shows **Verified municipal
   update**.
4. **NCP** — **Publish to public display**. The `/ncp/display` tab switches to
   the drinking-water notice in full-screen type, hands-free.
5. Point out: turn off Wi-Fi and repeat — nothing changes. The transport never
   needed a network.

**Reset:** the **Reset demo** button (bottom of any operator screen, tap twice).
**Tamper check (optional):** edit one character of a pasted transfer code before
receiving at the NCP → red *Signature invalid — do not publish*, publishing
blocked.

## How verification works

Municipal Command signs each update with an Ed25519 private key. Every NCP
embeds the matching public key (`lib/keys.ts`). On receipt the NCP re-computes
the signature over a canonical JSON of the payload:

- **valid** → green *Verified municipal update*, publishing allowed
- **invalid / tampered** → red *Signature invalid — do not publish*, publish
  button removed, update not stored

The demo keypair is the RFC 8032 test vector, shipped in the repo on purpose —
in a real deployment the private key never leaves Command hardware.

## Transfer format

`MOISS1:` + base64(JSON) where JSON is
`{ v, kind: "crisis_update" | "field_report", data, sig, pub, mode }`.
Small enough for one QR (~600 chars). Three import routes everywhere:
**camera**, **image upload**, **paste** — the demo can't fail on a camera
permission.

## Optional: two-way field reporting

`/ncp` can file a **Field report** (medical, water, fire, …) → generates a
courier-pickup QR → `/command` imports it under **Field reports (return trip)**.
Same offline mechanism, opposite direction — delay-tolerant upstream reporting.

## Branding note

The municipal mark in the header is a **clearly-labelled placeholder**
(`components/Brand.tsx`). Drop the official asset at
`public/gemeente-eindhoven-logo.svg` and render it there once its use is cleared.
No fake or altered municipality logo is included.

## Project layout

```
app/            command · courier · ncp · ncp/display · about
components/      RoleHeader · UpdateCard · QRDisplay · QRScanner ·
                VerificationBadge · PublicDisplay · DemoControls · Brand
lib/            storage · transfer · verification · keys · demo · util
types/          CrisisUpdate · FieldReport · TransferPayload · StoredUpdate
```
