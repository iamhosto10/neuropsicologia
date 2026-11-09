"use client";
// En el HQ: reenvía partidas que no se pudieron guardar antes y refresca el panel si recuperó alguna.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { flushPendingSaves } from "@/lib/mission-save-client";

export default function PendingSavesSync({ kidId }: { kidId: string }) {
  const router = useRouter();
  useEffect(() => {
    flushPendingSaves(kidId).then((n) => {
      if (n > 0) router.refresh();
    });
  }, [kidId, router]);
  return null;
}
