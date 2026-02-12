import { CoursesGallery } from "@/components/courses/courses-gallery";
import { coursesQuery } from "@/lib/query";
import { Course } from "@/lib/types";
import { client } from "@/sanity/lib/client";

const page = async () => {
  const courses: Course[] = await client.fetch(coursesQuery, {});

  console.log("course: ", courses);
  return <CoursesGallery courses={courses} />;
};

export default page;
