// src/app/(site)/actividades/page.tsx
import { client } from "@/sanity/lib/client";
import { getAllActivitiesQuery } from "@/lib/query";
import { HeroSection } from "@/components/heroSection/hero-section";
import ActivityCatalog from "@/components/catalog/activity-catalog";

export const dynamic = "force-dynamic";

export default async function ActividadesPage() {
  const activities = await client.fetch(getAllActivitiesQuery);

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <HeroSection
        title="Catálogo de Actividades"
        subtitle="Ejercicios prácticos y dinámicos para reforzar el aprendizaje en casa o en consulta."
        color="bg-amber-500"
      />
      <ActivityCatalog initialActivities={activities} />
    </main>
  );
}
