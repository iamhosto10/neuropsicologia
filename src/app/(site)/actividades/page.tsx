// src/app/(site)/actividades/page.tsx
import { client } from "@/sanity/lib/client";
import { getAllActivitiesQuery } from "@/lib/query";
import ActivityCatalog from "@/components/catalog/activity-catalog";
import { cookies } from "next/headers";
import { Target, Compass, ArrowLeft, Beaker } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actividades Clínicas | Academia Espacial",
  description:
    "Explora ejercicios prácticos y dinámicos para reforzar el aprendizaje cognitivo en casa o en consulta.",
};

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
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500 min-h-screen">
      {/* ENCABEZADO LIMPIO (Igual que en Cursos) */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Laboratorio de Actividades
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          {activeKidId
            ? "Ejercicios prácticos para reforzar tu entrenamiento estelar."
            : "Explora nuestro catálogo de ejercicios dinámicos diseñados para reforzar el aprendizaje en casa o en consulta."}
        </p>
      </div>

      {activeKidId && (
        <Link
          href="/hq"
          className="inline-flex items-center bg-white text-emerald-600 hover:text-emerald-700 font-bold mb-8 px-5 py-3 rounded-full border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 group transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al Cuartel General
        </Link>
      )}

      {/* SECCIÓN 1: Actividades asignadas (Solo si tiene tareas) */}
      {assignedActivities.length > 0 ? (
        <div className="mb-16 bg-linear-to-br from-emerald-50 to-teal-50/50 p-6 md:p-8 rounded-[2rem] border-2 border-emerald-100 shadow-sm relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Beaker className="w-32 h-32 text-emerald-600" />
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
                className="bg-white p-6 rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                <div className="h-40 relative bg-slate-100 rounded-2xl overflow-hidden mb-4 shrink-0">
                  <img
                    src={activity.imageUrl || "/placeholder-image.jpg"}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                  {activity.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 grow">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between text-sm font-bold text-emerald-600 pt-4 border-t border-slate-100 mt-auto w-full">
                  <span>Empezar actividad</span>
                  <ArrowLeft className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : activeKidId ? (
        /* Empty State amigable si el niño entró pero no tiene tareas hoy */
        <div className="mb-16 text-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            ¡Laboratorio Libre, Cadete!
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No tienes actividades asignadas por hoy. Puedes descansar o explorar
            el catálogo libremente.
          </p>
        </div>
      ) : null}

      {/* 🔥 SECCIÓN 2: EL CATÁLOGO GENERAL 🔥 */}
      <div className="mt-8 pt-8">
        <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <Compass className="w-8 h-8 text-indigo-500" />
          Catálogo de Exploración Libre
        </h2>

        {activities && activities.length > 0 ? (
          <ActivityCatalog initialActivities={activities} />
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">
              No hay actividades disponibles en este momento. Vuelve pronto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
