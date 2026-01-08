import { CourseContent } from "./course-content";
import { CourseHero } from "./course-hero";
import { CourseSyllabus } from "./course-syllabus";
import { RelatedCourses } from "./related-courses";
import { SanityCourse, SanityCourseDetail } from "@/lib/types";

interface CourseDetailViewProps {
  course: SanityCourseDetail;
  relatedCourses: SanityCourse[];
}

export function CourseDetailView({ course, relatedCourses }: CourseDetailViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <CourseHero course={course} />
      <CourseContent />
      <CourseSyllabus syllabus={course.syllabus} />
      <RelatedCourses courses={relatedCourses} />
    </div>
  );
}
