// src/app/(site)/cursos/[courseSlug]/[lessonSlug]/page.tsx
import { client } from "@/sanity/lib/client";
import { getCourseAndLessonQuery } from "@/lib/query";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { courseSlug: string; lessonSlug: string };
}) {
  const { courseSlug, lessonSlug } = await params;

  const data = await client.fetch(getCourseAndLessonQuery, {
    courseSlug,
    lessonSlug,
  });

  if (!data || !data.currentLesson) {
    notFound();
  }

  const { currentLesson, syllabus, title: courseTitle } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pt-16">
      {/* SIDEBAR: Temario de Navegación */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 md:h-[calc(100vh-4rem)] flex flex-col shrink-0 md:sticky md:top-16 z-10">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <Link
            href={`/cursos/${courseSlug}`}
            className="text-sm font-bold text-slate-500 hover:text-cyan-600 flex items-center gap-2 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Curso
          </Link>
          <h2 className="font-black text-xl text-slate-900 leading-tight">
            {courseTitle}
          </h2>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-6">
          {syllabus?.map((module: any, mIndex: number) => (
            <div key={mIndex} className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-2 mb-3">
                {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons?.map((lesson: any, lIndex: number) => {
                  const isActive = lesson.slug === lessonSlug;
                  return (
                    <Link
                      key={lesson._id}
                      href={`/cursos/${courseSlug}/${lesson.slug}`}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-cyan-50 border border-cyan-100"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div
                        className={`mt-0.5 ${isActive ? "text-cyan-500" : "text-slate-300"}`}
                      >
                        {isActive ? (
                          <PlayCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <p
                        className={`text-sm font-medium ${isActive ? "text-cyan-700 font-bold" : "text-slate-600"}`}
                      >
                        {lIndex + 1}. {lesson.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT: Área de Lectura / Visualización */}
      <main className="flex-1 bg-white md:h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
          {/* Cabecera de la Lección */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-sm font-bold mb-6">
              <BookOpen className="w-4 h-4" /> Lección Actual
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              {currentLesson.title}
            </h1>
          </div>

          {/* El Renderizador Mágico de Sanity */}
          <div className="prose prose-lg prose-slate prose-headings:font-bold prose-a:text-cyan-600 hover:prose-a:text-cyan-500 prose-img:rounded-3xl prose-img:shadow-md max-w-none">
            {currentLesson.content ? (
              <PortableText
                value={currentLesson.content}
                // Aquí puedes añadir custom renderers para imágenes o módulos de juego más adelante
              />
            ) : (
              <p className="text-slate-500 italic">
                El contenido de esta lección se está preparando.
              </p>
            )}
          </div>

          {/* Controles Inferiores */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center">
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6 font-bold text-slate-600 border-slate-200"
            >
              Lección Anterior
            </Button>
            <Button className="rounded-xl h-12 px-6 font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">
              Marcar como Completada
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
