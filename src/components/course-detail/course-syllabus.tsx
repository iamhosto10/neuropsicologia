import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default function CourseSyllabus({
  syllabus = [],
  courseSlug,
}: {
  syllabus: any[];
  courseSlug: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Contenido del Curso
      </h2>

      {syllabus?.length > 0 ? (
        <div className="space-y-8">
          {/* Mapeamos los Módulos */}
          {syllabus.map((module, moduleIndex) => (
            <div key={moduleIndex} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 border-slate-100">
                {module.title}
              </h3>

              {/* Mapeamos las lecciones dentro de este módulo */}
              <div className="space-y-3">
                {module.lessons?.length > 0 ? (
                  module.lessons.map((lesson: any, lessonIndex: number) => (
                    <Link
                      href={`/cursos/${courseSlug}/${lesson.slug}`}
                      key={lesson._id || lessonIndex}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/50 transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                            {lesson.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic pl-4">
                    No hay lecciones en este módulo aún.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          Las lecciones de este curso estarán disponibles pronto.
        </p>
      )}
    </div>
  );
}
