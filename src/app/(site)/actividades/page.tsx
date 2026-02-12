import { ActivityCatalog } from "@/components/catalog/activity-catalog";
import { activitiesQuery } from "@/lib/query";
import { client } from "@/sanity/lib/client";
import { Activity } from "../../../lib/types";

const page = async () => {
  const activities: Activity[] = await client.fetch(activitiesQuery, {});

  console.log("actividades: ", activities);
  return <ActivityCatalog activities={activities} />;
};

export default page;
