"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDailySession } from "@/app/actions/mission.actions";

export default function DeleteSessionButton({
  sessionId,
  kidId,
}: {
  sessionId: string;
  kidId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteDailySession(sessionId, kidId);
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="h-10 w-10 rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:bg-slate-50 transition-all"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
