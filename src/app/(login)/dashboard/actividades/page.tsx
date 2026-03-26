// src/app/(login)/dashboard/actividades/page.tsx
import { Beaker } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import AssignButton from "@/components/dashboard/assign-button";
import CoursesCard from "@/components/courses/courses-card"; // 🔥 Importamos nuestra tarjeta unificada

export const dynamic = "force-dynamic";

export default async function MisActividadesPage() {
  const { userId } = await auth();
  const sanityUserId = `user-${userId}`;

  // 1. Traemos todas las actividades reales de Sanity (Query intacto)
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

  // 2. Traemos a los cadetes (pacientes/hijos) que pertenecen a este adulto (Query intacto)
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
            <CoursesCard
              key={activity._id}
              title={activity.title}
              description={activity.description}
              image={activity.image}
              href={`/actividades/${activity.slug}`}
              level={activity.level || "General"}
              duration={activity.duration}
              actionSlot={
                kids.length > 0 ? (
                  <AssignButton
                    kids={kids}
                    itemId={activity._id}
                    itemType="activity"
                  />
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
