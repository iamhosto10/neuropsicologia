import { client } from "@/sanity/lib/client";
import { BookOpen, ArrowLeft, Layers, PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import LessonBuilderModal from "@/components/dashboard/lesson-builder-modal";
import EditLessonModal from "@/components/dashboard/edit-lesson-modal";
import DeleteLessonButton from "@/components/dashboard/delete-lesson-button";

export const dynamic = "force-dynamic";

export default async function CourseConstructorPage({
  params,
}: {
  params: Promise<{ cursoId: string }>; // Que coincida con el nombre de la carpeta
}) {
  const { cursoId } = await params;
  const courseId = cursoId;

  // 1. Traemos el curso con todo su syllabus expandido
  const query = `*[_type == "course" && _id == $courseId][0]{
    _id, title, description, level, duration,
    syllabus[]{
      title,
      lessons[]->{ _id, title, _type }
    }
  }`;

  const course = await client
    .withConfig({ useCdn: false })
    .fetch(query, { courseId: courseId });

  if (!course) {
    redirect("/dashboard/cursos");
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Navegación y Cabecera */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            href="/dashboard/cursos"
            className="inline-flex items-center text-slate-500 hover:text-cyan-600 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la Biblioteca
          </Link>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-500" /> Editor:{" "}
            {course.title}
          </h1>
          <div className="flex gap-2 mt-3">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 border-none"
            >
              {course.level}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 border-none"
            >
              {course.duration} min
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: El Syllabus (Lo que ya existe) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" /> Estructura del Curso
          </h2>

          {course.syllabus && course.syllabus.length > 0 ? (
            <div className="space-y-4">
              {course.syllabus.map((module: any, modIdx: number) => (
                <div
                  key={modIdx}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    Módulo: {module.title}
                  </h3>
                  {module.lessons && module.lessons.length > 0 ? (
                    <ul className="space-y-3">
                      {module.lessons.map((lesson: any) => (
                        <li
                          key={lesson._id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group"
                        >
                          <span className="font-medium text-slate-700">
                            {lesson.title}
                          </span>

                          {/* 🔥 AGRUPAMOS EL BADGE Y EL BOTÓN A LA DERECHA */}
                          <div className="flex items-center gap-3">
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">
                              Lección
                            </Badge>

                            <EditLessonModal
                              lessonId={lesson._id}
                              courseId={course._id}
                              existingModules={
                                course.syllabus?.map((mod: any) => mod.title) ||
                                []
                              }
                            />
                            <DeleteLessonButton
                              courseId={course._id}
                              lessonId={lesson._id}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No hay lecciones en este módulo aún.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
              <p className="text-slate-500 font-medium">
                El curso está vacío. Añade tu primera lección.
              </p>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Las Herramientas de Creación */}
        <div>
          <div className="bg-slate-900 rounded-3xl p-6 text-white sticky top-24 shadow-lg">
            <h3 className="font-bold text-lg mb-2">Herramientas</h3>
            <p className="text-slate-400 text-sm mb-6">
              Crea contenido interactivo y asígnalo a un módulo del curso.
            </p>

            {/* 🔥 EL MODAL PARA CREAR LA LECCIÓN */}
            <LessonBuilderModal
              courseId={course._id}
              existingModules={
                course.syllabus?.map((mod: any) => mod.title) || []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
