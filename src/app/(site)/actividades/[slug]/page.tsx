import ActivityAccordion from "@/components/activity-detail/activity-accordion";
import ActivityOverview from "@/components/activity-detail/activity-overview";
import { InstructionsList } from "@/components/activity-detail/instructions-list";
import RelatedActivities from "@/components/activity-detail/related-activities";
import { activitiesBySlugQuery } from "@/lib/query";
import { Activity } from "@/lib/types";
import { client } from "@/sanity/lib/client";

// 1. Corregimos la estructura de los tipos y la desestructuración
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  // 2. Hacemos el await directamente a params (estándar de Next.js 15)
  const { slug } = await params;

  const activity: Activity = await client.fetch(activitiesBySlugQuery, {
    slug,
  });

  console.log("actividad: ", activity);

  return (
    <>
      <ActivityOverview activity={activity} />
      <InstructionsList activity={activity} />
      <ActivityAccordion activity={activity} />
      <RelatedActivities activity={activity} />
    </>
  );
};

export default Page;
