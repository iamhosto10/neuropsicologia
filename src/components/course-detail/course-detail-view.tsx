"use client";

import CourseHero from "./course-hero";
import CourseSyllabus from "./course-syllabus";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Rocket, Zap, CheckCircle2 } from "lucide-react"; // 🔥 Iconos para los estados

export default function CourseDetailView({
  course,
  completedLessons = [],
}: {
  course: any;
  completedLessons?: string[];
}) {
  // 🔥 LÓGICA INTELIGENTE BASADA EN TU 'SYLLABUS' 🔥

  // 1. Extraemos una lista plana de todas las lecciones para calcular el progreso
  const allLessons =
    course.syllabus?.flatMap((module: any) => module.lessons || []) || [];

  // 2. Encontramos la primera lección que el niño NO ha completado
  const nextLesson = allLessons.find(
    (lesson: any) => !completedLessons.includes(lesson._id),
  );

  // 3. Determinamos el estado del curso
  const isFinished = allLessons.length > 0 && !nextLesson;
  const hasStarted = completedLessons.some((id: string) =>
    allLessons.some((lesson: any) => lesson._id === id),
  );

  return (
    <div className="pb-24">
      <CourseHero
        title={course.title}
        description={course.description}
        image={course.imageUrl || "/placeholder-image.jpg"}
        duration={course.duration}
        level={course.level}
      />

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CourseSyllabus syllabus={course.syllabus} courseSlug={course.slug} />
        </div>

        {/* Sidebar: El Botón Inteligente */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24 text-center transition-all">
            {isFinished ? (
              /* ESTADO: CURSO COMPLETADO */
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-slate-900">
                  ¡Misión Superada!
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Has completado todo el contenido de este entrenamiento.
                </p>
                <Button
                  disabled
                  className="w-full h-14 bg-green-500 text-white rounded-xl font-bold text-lg opacity-100"
                >
                  Curso Completado ✅
                </Button>
              </>
            ) : (
              /* ESTADO: EMPEZAR O CONTINUAR */
              <>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${hasStarted ? "bg-yellow-100 text-yellow-600" : "bg-cyan-100 text-cyan-600"}`}
                >
                  {hasStarted ? (
                    <Zap className="w-8 h-8" />
                  ) : (
                    <Rocket className="w-8 h-8" />
                  )}
                </div>
                <h3 className="font-bold text-xl mb-2 text-slate-900">
                  {hasStarted ? "¡Sigue así, Piloto!" : "¿Listo para empezar?"}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  {hasStarted
                    ? `Tu siguiente objetivo es: ${nextLesson?.title}`
                    : "Únete a este curso y descubre herramientas prácticas paso a paso."}
                </p>

                {nextLesson && (
                  <Link href={`/cursos/${course.slug}/${nextLesson.slug}`}>
                    <Button
                      className={`w-full h-14 text-white rounded-xl font-bold text-lg transition-transform active:scale-[0.98] ${hasStarted ? "bg-yellow-500 hover:bg-yellow-600" : "bg-cyan-500 hover:bg-cyan-600"}`}
                    >
                      {hasStarted ? "Continuar Misión" : "Empezar Gratis"}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
