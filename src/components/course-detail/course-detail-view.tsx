import { CourseContent } from './course-content';
import { CourseHero } from './course-hero';
import { CourseSyllabus } from './course-syllabus';
import { RelatedCourses } from './related-courses';

export function CourseDetailView() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <CourseHero />
      <CourseContent />
      <CourseSyllabus />
      <RelatedCourses />
    </div>
  );
}
