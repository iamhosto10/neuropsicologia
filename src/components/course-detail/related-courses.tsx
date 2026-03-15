import CoursesCard from "../courses/courses-card";
import { Course } from "@/lib/types";

export function RelatedCourses({ course }: { course: Course }) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">Quizás también te interese...</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {course?.relatedCourse?.map((course, index) => (
          <CoursesCard
            key={course._id}
            title={course.title}
            description={course.description + ""}
            image={course.image?.asset.url || "/placeholder-image.jpg"}
            href={`/cursos/${course.slug.current}`}
            duration={course.duration}
            level={course.level}
          />
        ))}
      </div>
    </div>
  );
}
