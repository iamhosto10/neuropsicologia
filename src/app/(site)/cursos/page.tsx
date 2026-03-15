// src/app/(site)/cursos/page.tsx
import { client } from "@/sanity/lib/client";
import { getAllCoursesQuery } from "@/lib/query";
import { HeroSection } from "@/components/heroSection/hero-section";
import CoursesGallery from "@/components/courses/courses-gallery";

// Forzamos la actualización para que los nuevos cursos salgan al instante
export const dynamic = "force-dynamic";

export default async function CursosPage() {
  // Buscamos los cursos reales en Sanity
  const courses = await client.fetch(getAllCoursesQuery);

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <HeroSection
        title="Nuestros Cursos"
        subtitle="Aprende estrategias y herramientas neuropsicológicas diseñadas para el desarrollo integral."
        color="bg-cyan-500"
      />
      {/* Le pasamos los datos dinámicos a tu galería */}
      <CoursesGallery initialCourses={courses} />
    </main>
  );
}
