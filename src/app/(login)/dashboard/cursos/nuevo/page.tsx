// src/app/(login)/dashboard/cursos/nuevo/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
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
import { createCourseAction } from "@/app/actions/builder.actions";
import Link from "next/link";

export default function NuevoCursoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const result = await createCourseAction(formData);

    if (result.success) {
      router.push(`/dashboard/cursos/leccion/${result.courseId}`);
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

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyan-500" />
          Crear Nuevo Curso
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Define la estructura básica del curso. Podrás añadir las lecciones y
          el contenido interactivo en el siguiente paso.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
      >
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-700 font-bold text-base">
            Título del Curso <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Ej. Entrenamiento de Memoria Espacial"
            required
            className="h-12 rounded-xl border-slate-300"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-slate-700 font-bold text-base"
          >
            Descripción Breve
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe brevemente los objetivos de este curso..."
            rows={3}
            className="rounded-xl border-slate-300 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-slate-700 font-bold">
              Edad Recomendada
            </Label>
            <Input
              id="age"
              name="age"
              placeholder="Ej. 6-9 años"
              className="h-12 rounded-xl border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-slate-700 font-bold">
              Duración Aprox. (min)
            </Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              placeholder="Ej. 30"
              className="h-12 rounded-xl border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level" className="text-slate-700 font-bold">
              Nivel Dificultad
            </Label>
            <Select name="level" defaultValue="Básico">
              <SelectTrigger className="h-12 rounded-xl border-slate-300">
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

        {/* 🔥 NUEVO: CAMPO DE IMAGEN DE PORTADA */}
        <div className="space-y-2">
          <Label htmlFor="image" className="text-slate-700 font-bold">
            Imagen de Portada
          </Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="cursor-pointer h-12 pt-3 rounded-xl border-slate-300"
          />
          <p className="text-xs text-slate-500">
            Sube una imagen atractiva para que tu curso destaque.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-all shadow-md shadow-cyan-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creando
                Curso...
              </>
            ) : (
              "Crear Curso y Continuar"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
