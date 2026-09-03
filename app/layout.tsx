import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "MOISS — Municipal Offline Information Sync System",
  description:
    "Offline crisis-information transport for prolonged power outages. Hackathon prototype.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#E41613",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-ehv-ink antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
