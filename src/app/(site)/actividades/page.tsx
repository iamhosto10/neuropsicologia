// src/app/(site)/actividades/page.tsx
import { client } from "@/sanity/lib/client";
import { getAllActivitiesQuery } from "@/lib/query";
import { HeroSection } from "@/components/heroSection/hero-section";
import ActivityCatalog from "@/components/catalog/activity-catalog";
import { cookies } from "next/headers";
import { Target, ArrowLeft } from "lucide-react"; // 🔥 Añadido ArrowLeft
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActividadesPage() {
  // 1. Traemos el catálogo completo
  const activities = await client.fetch(getAllActivitiesQuery);

  // 2. Revisamos si hay un cadete activo
  const cookieStore = await cookies();
  const activeKidId = cookieStore.get("activeKidId")?.value;

  let assignedActivities = [];

  if (activeKidId) {
    // Buscamos las actividades asignadas
    const kidData = await client.fetch(
      `*[_type == "kidProfile" && _id == $activeKidId][0]{
      assignedActivities[]->{
        _id, title, description, "slug": slug.current, duration, ageRange, "imageUrl": image.asset->url
      }
    }`,
      { activeKidId },
    );
    assignedActivities = kidData?.assignedActivities || [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <HeroSection
        title="Catálogo de Actividades"
        subtitle="Ejercicios prácticos y dinámicos para reforzar el aprendizaje en casa o en consulta."
        color="bg-amber-500"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 🔥 NUEVO: Botón inteligente para volver al HQ (Solo visible si es un cadete) */}
        {activeKidId && (
          <Link
            href="/hq"
            className="inline-flex items-center bg-white text-emerald-600 hover:text-emerald-700 font-bold mb-8 px-5 py-3 rounded-full border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 group transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al Cuartel General
          </Link>
        )}

        {/* ZONA DE ASIGNACIONES (Solo visible si hay tareas pendientes) */}
        {assignedActivities.length > 0 && (
          <div className="mb-16 bg-linear-to-br from-emerald-50 to-teal-50/50 p-6 md:p-8 rounded-[2rem] border-2 border-emerald-100 shadow-sm relative overflow-hidden animate-in fade-in duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Target className="w-32 h-32 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-black text-emerald-800 mb-6 flex items-center gap-3 relative z-10">
              <Target className="w-8 h-8 text-emerald-500" />
              Laboratorio Asignado por tu Comandante
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {assignedActivities.map((activity: any) => (
                <Link
                  key={`assigned-${activity._id}`}
                  href={`/actividades/${activity.slug}`}
                  className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {activity.description}
                  </p>
                  <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Empezar actividad →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Catálogo general */}
        <ActivityCatalog initialActivities={activities} />
      </div>
    </main>
  );
}
