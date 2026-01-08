import { CourseCard } from "../courses/courses-card";
import { SanityCourse } from "@/lib/types";

interface RelatedCoursesProps {
  courses: SanityCourse[];
}

export function RelatedCourses({ courses }: RelatedCoursesProps) {
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">Quizás también te interese...</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </div>
  );
}
