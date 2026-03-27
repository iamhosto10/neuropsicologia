// src/app/(login)/dashboard/cursos/[courseId]/editar/edit-course-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCourseMetadataAction } from "@/app/actions/builder.actions";
import Link from "next/link";

export default function EditCourseForm({ course }: { course: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await updateCourseMetadataAction(course._id, formData);

    if (result.success) {
      // 🔥 Al guardar exitosamente, lo llevamos al constructor de lecciones
      router.push(`/dashboard/cursos/leccion/${course._id}`);
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <Link
        href="/dashboard/cursos"
        className="inline-flex items-center text-slate-500 hover:text-cyan-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a la Biblioteca
      </Link>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-500" />
            Ajustes del Curso
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Modifica la información principal antes de editar las lecciones.
          </p>
        </div>

        {/* Botón de atajo por si no quiere guardar nada y solo quiere ir a las lecciones */}
        <Button
          asChild
          variant="ghost"
          className="text-indigo-600 hover:bg-indigo-50 font-bold"
        >
          <Link href={`/dashboard/cursos/leccion/${course._id}`}>
            Saltar a Lecciones <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
      >
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" className="font-bold text-base">
            Título del Curso *
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue={course.title}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-bold text-base">
            Descripción
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={course.description}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age" className="font-bold">
              Edad Recomendada
            </Label>
            <Input
              id="age"
              name="age"
              defaultValue={course.age}
              placeholder="Ej. 6-9 años"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="font-bold">
              Duración (min)
            </Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              defaultValue={course.duration}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level" className="font-bold">
              Nivel de Dificultad
            </Label>
            <Select name="level" defaultValue={course.level || "Básico"}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image" className="font-bold">
            Imagen de Portada
          </Label>
          {course.image && (
            <div className="mb-4 w-48 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={course.image}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="cursor-pointer h-12 pt-3"
          />
          <p className="text-xs text-slate-500">
            Sube una imagen nueva solo si deseas reemplazar la actual.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...
              </>
            ) : (
              "Guardar y Editar Lecciones"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
