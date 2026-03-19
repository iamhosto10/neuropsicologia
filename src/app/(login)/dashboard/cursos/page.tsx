// src/app/(login)/dashboard/cursos/page.tsx
import { BookOpen } from "lucide-react";
import { client } from "@/sanity/lib/client";
import CoursesCard from "@/components/courses/courses-card";

export const dynamic = "force-dynamic";

export default async function MisCursosPage() {
  // Traemos todos los cursos de Sanity (sin progreso simulado)
  const query = `*[_type == "course"] {
    _id,
    title,
    "slug": slug.current,
    description,
    level,
    "image": image.asset->url
  }`;

  const courses = await client.fetch(query);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyan-500" />
          Biblioteca de la Academia
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Explora los módulos educativos disponibles para tus cadetes.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-slate-500">
            No hay cursos disponibles en la plataforma por ahora.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CoursesCard
              key={course._id}
              title={course.title}
              description={course.description}
              image={course.image}
              href={`/cursos/${course.slug}`}
              level={course.level}
              // Ya no le pasamos 'progress', así que la barra se oculta sola
            />
          ))}
        </div>
      )}
    </div>
  );
}
