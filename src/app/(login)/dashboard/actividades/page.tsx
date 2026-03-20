// src/app/(login)/dashboard/actividades/page.tsx
import { Beaker } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import AssignButton from "@/components/dashboard/assign-button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MisActividadesPage() {
  const { userId } = await auth();
  const sanityUserId = `user-${userId}`;

  // 1. Traemos todas las actividades reales de Sanity
  const queryActivities = `*[_type == "activity"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    level,
    duration,
    "image": image.asset->url
  }`;
  const activities = await client
    .withConfig({ useCdn: false })
    .fetch(queryActivities);

  // 2. Traemos a los cadetes (pacientes/hijos) que pertenecen a este adulto
  const queryKids = `*[_type == "kidProfile" && parent._ref == $sanityUserId] {
    _id, 
    alias
  }`;
  const kids = await client
    .withConfig({ useCdn: false })
    .fetch(queryKids, { sanityUserId });

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Beaker className="w-8 h-8 text-emerald-500" />
          Laboratorio de Actividades
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Explora los ejercicios físicos y cognitivos offline, y asígnalos a la
          bandeja de tus cadetes.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-slate-500">
            No hay actividades disponibles en el laboratorio por ahora.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity: any) => (
            <div
              key={activity._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {activity.image ? (
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                    <Beaker className="w-12 h-12 text-emerald-200" />
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col grow">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold"
                  >
                    {activity.level || "General"}
                  </Badge>
                  <span className="text-xs font-bold text-slate-400">
                    {activity.duration
                      ? `${activity.duration} min`
                      : "Variable"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {activity.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 grow">
                  {activity.description}
                </p>

                {/* 🔥 EL BOTÓN DE ASIGNAR Y EL LINK AL DETALLE */}
                <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                  <Link
                    href={`/actividades/${activity.slug}`}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-bold block text-center mb-3"
                  >
                    Ver instrucciones completas
                  </Link>
                  {kids.length > 0 && (
                    <AssignButton
                      kids={kids}
                      itemId={activity._id}
                      itemType="activity" // 👈 Clave para que vaya al array correcto
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
