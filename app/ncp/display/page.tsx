"use client";

import type { CrisisUpdate } from "@/types";
import { PublicDisplay } from "@/components/PublicDisplay";
import { useStore } from "@/components/useStore";
import { getNcpPublished } from "@/lib/storage";

export default function DisplayPage() {
  const [published] = useStore<CrisisUpdate | null>(getNcpPublished, null);
  return <PublicDisplay update={published} location="Strijp-S" />;
}
