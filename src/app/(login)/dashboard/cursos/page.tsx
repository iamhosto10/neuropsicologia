import { BookOpen } from "lucide-react";
import { client } from "@/sanity/lib/client";
import CoursesCard from "@/components/courses/courses-card";

export const dynamic = "force-dynamic";

export default async function MisCursosPage() {
  const query = `*[_type == "course"] {
    _id,
    title,
    "slug": slug.current,
    description,
    level,
    "image": image.asset->url
  }`;

  const fetchedCourses = await client.fetch(query);

  const simulatedProgress = [45, 0, 100, 15, 0, 100];

  const coursesWithProgress = fetchedCourses.map(
    (course: any, index: number) => ({
      ...course,
      progress: simulatedProgress[index % simulatedProgress.length], // Cicla los progresos simulados
    }),
  );

  const sortedCourses = coursesWithProgress.sort((a: any, b: any) => {
    const aPriority =
      a.progress > 0 && a.progress < 100 ? 1 : a.progress === 0 ? 2 : 3;
    const bPriority =
      b.progress > 0 && b.progress < 100 ? 1 : b.progress === 0 ? 2 : 3;
    return aPriority - bPriority;
  });

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyan-500" />
          Mi Academia
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Retoma tus lecciones donde las dejaste.
        </p>
      </div>

      {sortedCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-slate-500">
            No hay cursos disponibles en la plataforma.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map((course: any) => (
            <CoursesCard
              key={course._id}
              title={course.title}
              description={course.description}
              image={course.image}
              href={`/cursos/${course.slug}`}
              level={course.level}
              progress={course.progress} // Pasamos el progreso al componente
            />
          ))}
        </div>
      )}
    </div>
  );
}
