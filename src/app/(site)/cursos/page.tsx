// src/app/(site)/cursos/page.tsx
import { client } from "@/sanity/lib/client";
import { cookies } from "next/headers";
import CoursesGallery from "@/components/courses/courses-gallery";
import CoursesCard from "@/components/courses/courses-card";
import { Target, Compass, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cursos Cognitivos | Academia Espacial",
  description:
    "Explora cursos diseñados para mejorar la atención, memoria, control inhibitorio y habilidades cognitivas. Aprende a tu ritmo con misiones interactivas.",
  openGraph: {
    title: "Academia Espacial - Cursos Cognitivos",
    description:
      "Cursos interactivos para desarrollar habilidades cognitivas clave como memoria, atención y flexibilidad mental.",
    type: "website",
  },
};

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
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          {activeKidId
            ? "Aprende nuevas habilidades para tu misión intergaláctica."
            : "Explora nuestro catálogo de entrenamiento cognitivo diseñado para desarrollar atención, memoria y flexibilidad mental."}
        </p>
      </div>

      {activeKidId && (
        <Link
          href="/hq"
          className="inline-flex items-center bg-white text-cyan-600 hover:text-cyan-700 font-bold mb-8 px-5 py-3 rounded-full border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 group transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al Cuartel General
        </Link>
      )}

      {/* SECCIÓN 1: Cursos asignados por el terapeuta (Solo si tiene tareas) */}
      {assignedCourses.length > 0 ? (
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
      ) : activeKidId ? (
        /* Empty State amigable si el niño entró pero no tiene tareas hoy */
        <div className="mb-16 text-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            ¡Todo despejado, Cadete!
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No tienes misiones asignadas por hoy. Puedes descansar o explorar el
            catálogo libremente.
          </p>
        </div>
      ) : null}

      {/* 🔥 SECCIÓN 2: EL CATÁLOGO GENERAL (ESTO ES LO QUE FALTABA) 🔥 */}
      <div className="mt-8 pt-8">
        <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <Compass className="w-8 h-8 text-indigo-500" />
          Catálogo de Exploración Libre
        </h2>

        {/* Aquí finalmente usamos la variable allCourses que extrajiste arriba */}
        {allCourses && allCourses.length > 0 ? (
          <CoursesGallery initialCourses={allCourses} />
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">
              No hay cursos disponibles en este momento. Vuelve pronto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
