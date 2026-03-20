// src/app/(site)/cursos/page.tsx
import { client } from "@/sanity/lib/client";
import { cookies } from "next/headers";
import CoursesGallery from "@/components/courses/courses-gallery";
import CoursesCard from "@/components/courses/courses-card";
import { Target, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  // 1. Traemos el catálogo general completo
  const allCourses =
    await client.fetch(`*[_type == "course"] | order(_createdAt desc) {
    _id, title, description, "image": image.asset->url, "slug": slug.current, duration, level
  }`);

  // 2. Revisamos si hay un cadete (niño) activo en la tablet
  const cookieStore = await cookies();
  const activeKidId = cookieStore.get("activeKidId")?.value;

  let assignedCourses = [];

  if (activeKidId) {
    // Si hay un niño, buscamos específicamente qué cursos le asignó su terapeuta
    const kidData = await client.fetch(
      `*[_type == "kidProfile" && _id == $activeKidId][0]{
      assignedCourses[]->{
        _id, title, description, "image": image.asset->url, "slug": slug.current, duration, level
      }
    }`,
      { activeKidId },
    );

    assignedCourses = kidData?.assignedCourses || [];
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Academia Espacial
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Aprende nuevas habilidades para tu misión intergaláctica.
        </p>
      </div>

      {/* 🔥 LA MAGIA: Sección exclusiva solo si el cadete tiene tareas pendientes */}
      {assignedCourses.length > 0 && (
        <div className="mb-16 bg-linear-to-br from-cyan-50 to-blue-50/50 p-6 md:p-8 rounded-[2rem] border-2 border-cyan-100 shadow-sm relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Target className="w-32 h-32 text-cyan-600" />
          </div>

          <h2 className="text-2xl font-black text-cyan-800 mb-6 flex items-center gap-3 relative z-10">
            <Target className="w-8 h-8 text-cyan-500" />
            Asignados por tu Comandante
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {assignedCourses.map((course: any) => (
              <CoursesCard
                key={`assigned-${course._id}`}
                title={course.title}
                description={course.description}
                image={course.image || "/placeholder-image.jpg"}
                href={`/cursos/${course.slug}`}
                duration={course.duration}
                level={course.level}
              />
            ))}
          </div>
        </div>
      )}

      {/* <div>
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <Compass className="w-8 h-8 text-slate-400" />
          Exploración Libre
        </h2>
        <CoursesGallery initialCourses={allCourses} />
      </div> */}
    </div>
  );
}
