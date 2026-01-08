import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Clock, BarChart, PlayCircle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { SanityCourseDetail } from "@/lib/types";

interface CourseHeroProps {
  course: SanityCourseDetail;
}

export function CourseHero({ course }: CourseHeroProps) {
  // Calculate total duration if possible, or use a placeholder/field if available
  // The query doesn't return total duration on the course object, but we have it on lessons.
  // Let's assume we sum up duration from lessons if available, or just show a placeholder.

  let totalDuration = 0;
  if(course.syllabus) {
      course.syllabus.forEach(module => {
          if(module.lessons) {
              module.lessons.forEach(lesson => {
                  totalDuration += lesson.duration || 0;
              });
          }
      });
  }

  // Determine level from the first lesson or a common field? The query has level on lessons.
  // Let's pick the level from the first lesson as a representative, or default to "Principiante".
  const level = course.syllabus?.[0]?.lessons?.[0]?.level || "Principiante";


  const metadata = [
    { icon: Smile, label: "Edad Recomendada", value: course.age },
    { icon: Clock, label: "Duración Estimada", value: `${totalDuration} min` }, // Assuming duration is in minutes
    { icon: BarChart, label: "Nivel", value: level },
  ];

  return (
    <div className=" flex  flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-0 gap-8">
      <header>
        <Breadcrumb className="text-sm text-muted-foreground">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cursos">cursos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl md:text-5xl font-extrabold text-black mt-2">
          {course.title}
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 ">
        {/* Left Column: Video */}
        <div className="w-full lg:w-2/3">
          <div className={`relative aspect-video ${course.bgColor || "bg-gray-900"} rounded-[2rem] flex items-center justify-center p-4`}>
            {/* Placeholder for a video or image */}
            <div className="absolute inset-0 bg-black/10 rounded-[2rem]"></div>
            <PlayCircle className="h-20 w-20 text-white/70" />
          </div>
        </div>

        {/* Right Column: Sidebar/Metadata */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col md:flex-row lg:flex-col gap-4">
              {metadata.map((item, index) => (
                <Card
                  key={index}
                  className="p-4 rounded-2xl shadow-sm flex-1 flex flex-col items-left justify-center gap-2"
                >
                  <item.icon className="h-8 w-8 text-brand-mustard" />
                  <span className="font-semibold">{item.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                </Card>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full bg-[oklch(var(--brand-sky))] text-black font-bold rounded-full text-lg py-6"
            >
              Inscríbete ahora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
