import { CourseDetailView } from "@/components/course-detail/course-detail-view";
import { courseBySlugQuery } from "@/lib/query";
import { Course } from "@/lib/types";
import { client } from "@/sanity/lib/client";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const course: Course = await client.fetch(courseBySlugQuery, {
    slug,
  });

  console.log("curso: ", course);

  return <CourseDetailView course={course} />;
};

export default Page;
