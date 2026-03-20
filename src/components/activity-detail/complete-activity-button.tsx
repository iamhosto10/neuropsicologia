// src/components/activity-detail/complete-activity-button.tsx
"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { markActivityCompleted } from "@/app/actions/activity.actions";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Loader2 } from "lucide-react";

export default function CompleteActivityButton({
  kidId,
  activityId,
  isCompleted,
}: {
  kidId: string;
  activityId: string;
  isCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(isCompleted);
  const pathname = usePathname();

  const handleComplete = () => {
    if (done || !kidId) return;

    startTransition(async () => {
      const res = await markActivityCompleted(kidId, activityId, pathname);
      if (res.success) {
        setDone(true);
      }
    });
  };

  if (!kidId) return null; // Solo se muestra si hay un cadete activo

  if (done) {
    return (
      <div className="mt-8 bg-green-50 border-2 border-green-200 text-green-700 p-6 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg w-full">
        <CheckCircle className="w-6 h-6 text-green-500" />
        ¡Actividad Superada!
      </div>
    );
  }

  return (
    <Button
      onClick={handleComplete}
      disabled={isPending}
      className="mt-8 w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-[0_0_20px_-5px_#10b981] transition-all hover:scale-[1.02]"
    >
      {isPending ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          Finalizar Actividad{" "}
          <Zap className="w-5 h-5 ml-2 fill-yellow-400 text-yellow-400" /> +20
        </>
      )}
    </Button>
  );
}
