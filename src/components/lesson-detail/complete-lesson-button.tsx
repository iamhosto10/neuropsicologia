// src/components/lesson-detail/complete-lesson-button.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
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
  // Usamos estado optimista para que cambie a verde apenas el usuario hace clic
  const [optimisticComplete, setOptimisticComplete] = useState(isCompleted);

  // Si no hay un niño seleccionado (ej. un visitante público)
  if (!kidId) {
    return (
      <Button
        disabled
        variant="outline"
        className="rounded-xl h-12 px-6 font-bold bg-slate-100 text-slate-400"
      >
        Inicia sesión para guardar tu progreso
      </Button>
    );
  }

  // Si la lección ya está terminada
  if (optimisticComplete) {
    return (
      <Button
        disabled
        className="rounded-xl h-12 px-6 font-bold bg-green-500 text-white flex items-center gap-2 opacity-100"
      >
        <CheckCircle className="w-5 h-5" /> Lección Completada
      </Button>
    );
  }

  // Función al hacer clic
  const handleComplete = () => {
    startTransition(async () => {
      setOptimisticComplete(true); // Se pone verde al instante (UX fluida)
      await markLessonCompleted(kidId, lessonId, currentPath);
    });
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={isPending}
      className="rounded-xl h-12 px-6 font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      Marcar como Completada
    </Button>
  );
}
