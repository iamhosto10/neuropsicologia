"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Zap } from "lucide-react";
import { markLessonCompleted } from "@/app/actions/course.actions";

interface Props {
  kidId: string | null;
  lessonId: string;
  isCompleted: boolean;
  currentPath: string;
}

export default function CompleteLessonButton({
  kidId,
  lessonId,
  isCompleted,
  currentPath,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticComplete, setOptimisticComplete] = useState(isCompleted);
  const router = useRouter();

  if (!kidId) {
    return (
      <Button
        disabled
        variant="outline"
        className="rounded-xl h-12 px-6 font-bold bg-slate-50 text-slate-400 border-slate-200"
      >
        Modo Explorador: Progreso no guardado
      </Button>
    );
  }

  if (optimisticComplete) {
    return (
      <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
        <Button
          disabled
          className="rounded-xl h-12 px-6 font-bold bg-green-500 text-white flex items-center gap-2 opacity-100 shadow-lg shadow-green-500/20"
        >
          <CheckCircle className="w-5 h-5" /> Lección Completada
        </Button>
        <p className="text-xs font-black text-yellow-600 flex items-center gap-1 uppercase tracking-widest">
          <Zap className="w-3 h-3 fill-yellow-500 text-yellow-500" /> +10
          Cristales Obtenidos
        </p>
      </div>
    );
  }
  const handleComplete = () => {
    startTransition(async () => {
      setOptimisticComplete(true); // Se pone verde al instante
      await markLessonCompleted(kidId, lessonId, currentPath);
      router.refresh(); // Actualiza la página silenciosamente
    });
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={isPending}
      className="rounded-xl h-12 px-8 font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 text-lg"
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      {isPending ? "Guardando progreso..." : "Marcar como Completada"}
    </Button>
  );
}
