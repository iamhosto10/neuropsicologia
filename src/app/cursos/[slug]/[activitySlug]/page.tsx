import { LessonView } from "@/components/lesson-detail/lesson-view";
import { client } from "@/sanity/lib/client";
import { GET_ACTIVITY_BY_SLUG } from "@/sanity/lib/queries";
import { SanityLesson } from "@/lib/types"; // I need to define SanityActivity
import { notFound } from "next/navigation";

// Define SanityActivity type based on the query
// GET_ACTIVITY_BY_SLUG returns: title, slug, description, duration, ageRange, level, image, video, materials, objectives

interface PageProps {
  params: Promise<{ slug: string; activitySlug: string }>;
}

const page = async ({ params }: PageProps) => {
  const { activitySlug } = await params;

  // The query expects $slug
  const activity = await client.fetch(
    GET_ACTIVITY_BY_SLUG,
    { slug: activitySlug },
    { next: { revalidate: 0 } }
  );

  if (!activity) {
    notFound();
  }

  return <LessonView activity={activity} />;
};

export default page;
