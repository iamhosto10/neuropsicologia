import { CoursesGallery } from "@/components/courses/courses-gallery";
import { client } from "@/sanity/lib/client";
import { GET_COURSES } from "@/sanity/lib/queries";
import { SanityCourse } from "@/lib/types";

const page = async () => {
  const courses = await client.fetch<SanityCourse[]>(
    GET_COURSES,
    {},
    { next: { revalidate: 0 } }
  );

  return <CoursesGallery courses={courses} />;
};

export default page;
