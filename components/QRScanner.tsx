"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Tab = "camera" | "image" | "paste";

const SCAN_INTERVAL_MS = 120; // ~8 scans/sec
const SCAN_MAX_DIM = 640; // downscale frames before decoding

/**
 * Import a transfer code by ANY of three routes. Camera is offered first but is
 * never required — image upload and paste always work, so a blocked camera can
 * never break the demo.
 */
export function QRScanner({
  onResult,
  label = "Receive update",
}: {
  onResult: (raw: string) => void;
  label?: string;
}) {
  const [tab, setTab] = useState<Tab>("camera");
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const lastScanRef = useRef(0);
  const doneRef = useRef(false);

  function getCanvas() {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    return canvasRef.current;
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function scanLoop(ts: number) {
    if (doneRef.current) return;
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      if (ts - lastScanRef.current >= SCAN_INTERVAL_MS) {
        lastScanRef.current = ts;
        const scale = Math.min(1, SCAN_MAX_DIM / Math.max(video.videoWidth, video.videoHeight));
        const w = Math.round(video.videoWidth * scale);
        const h = Math.round(video.videoHeight * scale);
        const canvas = getCanvas();
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const img = ctx.getImageData(0, 0, w, h);
          const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
          if (code?.data) {
            doneRef.current = true;
            stopCamera();
            onResult(code.data);
            return;
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }

  useEffect(() => {
    doneRef.current = false;
    if (tab !== "camera") {
      stopCamera();
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          rafRef.current = requestAnimationFrame(scanLoop);
        }
      } catch {
        setError("Camera unavailable. Use upload or paste instead.");
        setTab("paste");
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function handleImage(file: File) {
    setError("");
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
      const w = Math.round(image.naturalWidth * scale);
      const h = Math.round(image.naturalHeight * scale);
      const canvas = getCanvas();
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      URL.revokeObjectURL(url);
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      const code = jsQR(data.data, w, h);
      if (code?.data) onResult(code.data);
      else setError("No QR code found in that image.");
    };
    image.onerror = () => setError("Could not read that image.");
    image.src = url;
  }

  return (
    <div className="rounded-lg border border-ehv-grey-line bg-white p-4">
      <div className="mb-3 flex gap-1 rounded bg-ehv-grey p-1 text-sm font-semibold">
        {(["camera", "image", "paste"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setError("");
              setTab(t);
            }}
            className={`flex-1 rounded px-3 py-1.5 capitalize ${
              tab === t ? "bg-white text-ehv-ink shadow-sm" : "text-ehv-ink/55"
            }`}
          >
            {t === "image" ? "Upload" : t}
          </button>
        ))}
      </div>

      {tab === "camera" ? (
        <div className="overflow-hidden rounded bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-square w-full object-cover"
          />
        </div>
      ) : null}

      {tab === "image" ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-ehv-grey-line bg-ehv-grey px-4 py-10 text-center text-sm text-ehv-ink/60">
          Choose a QR photo or screenshot
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImage(f);
            }}
          />
        </label>
      ) : null}

      {tab === "paste" ? (
        <div>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="Paste transfer code (MOISS2:…)"
            className="h-28 w-full resize-none rounded border border-ehv-grey-line bg-ehv-grey p-2 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => {
              if (pasteValue.trim()) onResult(pasteValue.trim());
              else setError("Paste a transfer code first.");
            }}
            className="mt-2 w-full rounded bg-ehv-red px-4 py-2.5 font-semibold text-white"
          >
            {label}
          </button>
        </div>
      ) : null}

      {tab === "camera" ? (
        <p className="mt-2 text-center text-xs text-ehv-ink/50">
          Point at the sending screen. Auto-detects.
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-sm font-medium text-ehv-red">{error}</p>
      ) : null}
    </div>
  );
}
