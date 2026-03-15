import CourseHero from "./course-hero";
import CourseSyllabus from "./course-syllabus";
import { Button } from "@/components/ui/button";

export default function CourseDetailView({ course }: { course: any }) {
  console.log("curso", course);
  return (
    <div className="pb-24">
      <CourseHero
        title={course.title}
        description={course.description}
        image={course.imageUrl || "/placeholder-image.jpg"}
        duration={course.duration}
        level={course.level}
      />

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Temario */}
        <div className="lg:col-span-2 space-y-8">
          {/* 🔥 CAMBIAMOS 'lessons' POR 'syllabus' */}
          <CourseSyllabus syllabus={course.syllabus} courseSlug={course.slug} />
        </div>

        {/* Sidebar: Llamado a la Acción */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24 text-center">
            <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🚀
            </div>
            <h3 className="font-bold text-xl mb-2 text-slate-900">
              ¿Listo para empezar?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Únete a este curso y descubre herramientas prácticas paso a paso.
            </p>

            <Button className="w-full h-14 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-lg transition-transform active:scale-[0.98]">
              Inscribirse Gratis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
