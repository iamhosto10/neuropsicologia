import { CourseDetailView } from "@/components/course-detail/course-detail-view";
import { client } from "@/sanity/lib/client";
import { GET_COURSE_BY_SLUG, GET_COURSES } from "@/sanity/lib/queries";
import { SanityCourse, SanityCourseDetail } from "@/lib/types";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const course = await client.fetch<SanityCourseDetail>(
    GET_COURSE_BY_SLUG,
    { slug },
    { next: { revalidate: 0 } }
  );

  if (!course) {
    notFound();
  }

  // Fetch related courses (you might want a specific query for this later)
  const allCourses = await client.fetch<SanityCourse[]>(
    GET_COURSES,
    {},
    { next: { revalidate: 0 } }
  );

  // Filter out the current course
  const relatedCourses = allCourses.filter((c) => c.slug !== slug).slice(0, 3);

  return <CourseDetailView course={course} relatedCourses={relatedCourses} />;
};

export default page;
