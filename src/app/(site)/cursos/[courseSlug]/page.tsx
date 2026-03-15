import { client } from "@/sanity/lib/client";
import { getCourseBySlugQuery } from "@/lib/query";
import { notFound } from "next/navigation";
import CourseDetailView from "@/components/course-detail/course-detail-view";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const { courseSlug } = await params;

  const course = await client.fetch(getCourseBySlugQuery, { slug: courseSlug });

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <CourseDetailView course={course} />
    </main>
  );
}
