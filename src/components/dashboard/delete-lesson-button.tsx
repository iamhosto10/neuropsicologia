// src/components/dashboard/delete-lesson-button.tsx
"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLessonAction } from "@/app/actions/builder.actions";
import { useRouter } from "next/navigation";

export default function DeleteLessonButton({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // Pedimos confirmación para evitar tragedias
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta lección? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteLessonAction(courseId, lessonId);

    if (result.success) {
      // Pausa breve para indexación antes de recargar
      setTimeout(() => {
        router.refresh();
      }, 800);
    } else {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Eliminar Lección"
      className="rounded-full h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
