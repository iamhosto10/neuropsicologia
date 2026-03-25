import { getActiveKidId } from "@/app/actions/profile.actions";
import CompleteLessonButton from "@/components/lesson-detail/complete-lesson-button";
import { client } from "@/sanity/lib/client";
import { getCourseAndLessonQuery } from "@/lib/query";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Award,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ptComponents } from "@/components/lesson-detail/portable-text-components";
import InteractiveQuiz from "@/components/lesson-detail/interactive-quiz";
import InteractiveOpenQuestion from "@/components/lesson-detail/interactive-open-question";
import AudioPlayerBlock from "@/components/lesson-detail/audio-player-block";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string; lessonSlug: string };
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;

  const data = await client
    .withConfig({ useCdn: true })
    .fetch(
      getCourseAndLessonQuery,
      { courseSlug, lessonSlug },
      { cache: "force-cache" },
    );

  if (!data || !data.currentLesson) {
    return {
      title: "Lección no encontrada | Academia Espacial",
    };
  }

  const { currentLesson, title: courseTitle } = data;

  return {
    title: `${currentLesson.title} | ${courseTitle}`,
    description:
      currentLesson?.excerpt ||
      currentLesson?.description ||
      "Lección interactiva para entrenar habilidades cognitivas dentro de la Academia Espacial.",
    openGraph: {
      title: currentLesson.title,
      description:
        currentLesson?.excerpt ||
        "Aprende y entrena tu mente con esta lección interactiva.",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: currentLesson.title,
      description:
        currentLesson?.excerpt ||
        "Lección interactiva dentro de la Academia Espacial.",
    },
  };
}

const getSanityFileUrl = (ref: string) => {
  if (!ref) return "";
  const { projectId, dataset } = client.config();
  const [_file, id, extension] = ref.split("-");
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;
};

export default async function LessonPage({
  params,
}: {
  params: { courseSlug: string; lessonSlug: string };
}) {
  const { courseSlug, lessonSlug } = await params;

  // 1. Buscamos el curso y la lección
  const data = await client.fetch(getCourseAndLessonQuery, {
    courseSlug,
    lessonSlug,
  });

  if (!data || !data.currentLesson) notFound();

  const { currentLesson, syllabus, title: courseTitle } = data;

  // 2. Buscamos quién está viendo esto y su progreso
  const kidId = await getActiveKidId();
  let completedLessons: string[] = [];
  let completedQuizzes: string[] = [];
  let completedOpenQuestions: string[] = [];

  if (kidId) {
    const kidData = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "kidProfile" && _id == $kidId][0]{completedLessons, completedQuizzes, completedOpenQuestions}`,
        { kidId },
      );
    completedLessons = kidData?.completedLessons || [];
    completedQuizzes = kidData?.completedQuizzes || [];
    completedOpenQuestions = kidData?.completedOpenQuestions || [];
  }

  const isCurrentCompleted = completedLessons.includes(currentLesson._id);
  const currentPath = `/cursos/${courseSlug}/${lessonSlug}`;

  // 3. LÓGICA DE NAVEGACIÓN
  const flatLessons =
    syllabus?.flatMap((module: any) => module.lessons || []) || [];
  const currentIndex = flatLessons.findIndex((l: any) => l.slug === lessonSlug);

  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;

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
                  const isDone = completedLessons.includes(lesson._id);
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
                        className={`mt-0.5 ${isActive ? "text-cyan-500" : isDone ? "text-green-500" : "text-slate-300"}`}
                      >
                        {isActive ? (
                          <PlayCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <p
                        className={`text-sm font-medium ${isActive ? "text-cyan-700 font-bold" : isDone ? "text-slate-500 line-through decoration-slate-300" : "text-slate-600"}`}
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

      <main className="flex-1 bg-white md:h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
          {/* Cabecera */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-sm font-bold mb-6">
              <BookOpen className="w-4 h-4" /> Módulo{" "}
              {syllabus.findIndex((m: any) =>
                m.lessons?.some((l: any) => l.slug === lessonSlug),
              ) + 1}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              {currentLesson.title}
            </h1>
          </div>

          {/* Contenido Renderizado */}
          <div className="prose prose-lg prose-slate prose-headings:font-bold prose-a:text-cyan-600 hover:prose-a:text-cyan-500 max-w-none">
            {currentLesson.content ? (
              <PortableText
                value={currentLesson.content}
                // 🔥 Inyectamos el componente InteractiveQuiz dinámicamente
                components={{
                  ...ptComponents,
                  types: {
                    ...ptComponents.types,
                    lessonQuestion: ({ value }: any) => {
                      const uniqueId = `${currentLesson._id}-${value._key}`;
                      return (
                        <InteractiveQuiz
                          question={value.question}
                          options={value.options}
                          correctOptionIndex={value.correctOptionIndex}
                          reward={value.reward || 10}
                          lessonId={currentLesson._id}
                          isAlreadyCompleted={completedQuizzes?.includes(
                            uniqueId,
                          )}
                          currentPath={currentPath}
                          blockKey={value._key}
                        />
                      );
                    },
                    lessonOpenQuestion: ({ value }: any) => {
                      const uniqueId = `${currentLesson._id}-${value._key}`;
                      return (
                        <InteractiveOpenQuestion
                          question={value.question}
                          reward={value.reward || 15}
                          lessonId={currentLesson._id}
                          isAlreadyCompleted={completedOpenQuestions?.includes(
                            uniqueId,
                          )}
                          currentPath={currentPath}
                          blockKey={value._key}
                        />
                      );
                    },
                    lessonAudio: ({ value }: any) => {
                      if (!value?.audioFile?.asset?._ref) return null;
                      const audioUrl = getSanityFileUrl(
                        value.audioFile.asset._ref,
                      );
                      return (
                        <AudioPlayerBlock
                          title={value.title}
                          audioUrl={audioUrl}
                        />
                      );
                    },
                  },
                }}
              />
            ) : (
              <p className="text-slate-500 italic">
                El contenido de esta lección se está preparando.
              </p>
            )}
          </div>

          {/* 🔥 AQUÍ PONEMOS EL BOTÓN DE PROGRESO */}
          <div className="mt-16 flex justify-center border-t border-slate-100 pt-12">
            <CompleteLessonButton
              kidId={kidId}
              lessonId={currentLesson._id}
              isCompleted={isCurrentCompleted}
              currentPath={currentPath}
            />
          </div>

          {/* CONTROLES INFERIORES DE NAVEGACIÓN */}
          <div className="mt-12 flex flex-col-reverse md:flex-row gap-4 justify-between items-center">
            {prevLesson ? (
              <Link
                href={`/cursos/${courseSlug}/${prevLesson.slug}`}
                className="w-full md:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full md:w-auto rounded-xl h-14 px-6 font-bold text-slate-600 border-slate-200 gap-2 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Lección Anterior
                </Button>
              </Link>
            ) : (
              <div className="w-full md:w-auto hidden md:block"></div>
            )}

            {/* Solo mostramos el botón Siguiente si existe una lección posterior */}
            {nextLesson && (
              <Link
                href={`/cursos/${courseSlug}/${nextLesson.slug}`}
                className="w-full md:w-auto"
              >
                <Button className="w-full md:w-auto rounded-xl h-14 px-8 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg gap-2 transition-transform active:scale-95">
                  Siguiente Lección <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {!nextLesson && (
            <div className="mt-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-[2.5rem] p-8 md:p-12 text-center text-white shadow-xl shadow-green-500/20 animate-in fade-in slide-in-from-bottom-8 duration-700 border-4 border-green-400/30">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner backdrop-blur-md">
                <Award className="w-12 h-12 text-yellow-300 drop-shadow-md" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                ¡Has completado el curso!
              </h3>
              <p className="text-green-50 text-lg md:text-xl mb-8 max-w-lg mx-auto font-medium leading-relaxed">
                Llegaste al final de todas las lecciones. Tus nuevos
                conocimientos están listos para ponerse en práctica en el
                cuartel.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/hq" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto rounded-xl h-14 px-8 font-black bg-white text-green-700 hover:bg-green-50 hover:scale-105 transition-all shadow-xl shadow-black/10 gap-2 text-lg">
                    <Rocket className="w-6 h-6" /> Volver al Cuartel
                  </Button>
                </Link>
                <Link href="/cursos" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl h-14 px-8 font-bold text-green-700 border-white/40 hover:bg-white/20 gap-2 transition-colors text-lg"
                  >
                    Explorar la Academia
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
