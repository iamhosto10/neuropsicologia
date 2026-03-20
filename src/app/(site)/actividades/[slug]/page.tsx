// src/app/(site)/actividades/[slug]/page.tsx
import { client } from "@/sanity/lib/client";
import { getActivityBySlugQuery } from "@/lib/query";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ActivityOverview from "@/components/activity-detail/activity-overview";
import InstructionsList from "@/components/activity-detail/instructions-list";
import ActivityAccordion from "@/components/activity-detail/activity-accordion";
import RelatedActivities from "@/components/activity-detail/related-activities";
import { cookies } from "next/headers"; // 🔥 Importado
import CompleteActivityButton from "@/components/activity-detail/complete-activity-button"; // 🔥 Importado

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;

  // 1. Buscamos la actividad real (desactivamos caché por seguridad)
  const activity = await client
    .withConfig({ useCdn: false })
    .fetch(getActivityBySlugQuery, { slug }, { cache: "no-store" });

  if (!activity) notFound();

  // 🔥 2. Evaluamos el progreso del cadete activo
  const cookieStore = await cookies();
  const activeKidId = cookieStore.get("activeKidId")?.value;
  let isCompleted = false;

  if (activeKidId) {
    const kidData = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "kidProfile" && _id == $activeKidId][0]{ completedActivities }`,
        { activeKidId },
        { cache: "no-store" },
      );
    isCompleted = kidData?.completedActivities?.includes(activity._id) || false;
  }

  const mappedRelatedActivities =
    activity.relatedActivities?.map((rel: any) => ({
      id: rel._id,
      title: rel.title,
      image: rel.imageUrl || "/placeholder-image.jpg",
      duration: rel.duration ? `${rel.duration} min` : "Variable",
      href: `/actividades/${rel.slug}`,
    })) || [];

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* ... (Link de Volver e Inicio se mantienen igual) ... */}
        <Link
          href="/actividades"
          className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-bold mb-8 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al Laboratorio
        </Link>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <ActivityOverview
            {...activity}
            image={activity.imageUrl || "/placeholder-image.jpg"}
            duration={activity.duration?.toString()}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {activity.instructions && activity.instructions.length > 0 ? (
                <InstructionsList instructions={activity.instructions} />
              ) : (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
                  <p className="text-slate-500 italic">
                    Las instrucciones detalladas para esta actividad se están
                    preparando.
                  </p>
                </div>
              )}

              {/* 🔥 BOTÓN INYECTADO AQUÍ AL FINAL DE LAS INSTRUCCIONES */}
              {activeKidId && (
                <CompleteActivityButton
                  kidId={activeKidId}
                  activityId={activity._id}
                  isCompleted={isCompleted}
                />
              )}
            </div>

            <div className="space-y-8">
              <ActivityAccordion
                objectives={activity.objectives || []}
                materials={activity.materials || []}
              />
              {mappedRelatedActivities.length > 0 && (
                <RelatedActivities activities={mappedRelatedActivities} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
