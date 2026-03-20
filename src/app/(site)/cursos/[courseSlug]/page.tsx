// src/app/(site)/cursos/[courseSlug]/page.tsx
import { client } from "@/sanity/lib/client";
import { getCourseBySlugQuery } from "@/lib/query";
import { notFound } from "next/navigation";
import CourseDetailView from "@/components/course-detail/course-detail-view";
import { cookies } from "next/headers"; // 🔥 Importante

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const { courseSlug } = await params;

  // 1. Tu consulta original que ya funciona
  const course = await client
    .withConfig({ useCdn: false })
    .fetch(getCourseBySlugQuery, { slug: courseSlug }, { cache: "no-store" });

  if (!course) {
    notFound();
  }

  // 2. Buscamos el progreso del cadete activo
  const cookieStore = await cookies();
  const activeKidId = cookieStore.get("activeKidId")?.value;

  let completedLessons: string[] = [];

  if (activeKidId) {
    const kidData = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "kidProfile" && _id == $activeKidId][0]{ completedLessons }`,
        { activeKidId },
        { cache: "no-store" },
      );
    completedLessons = kidData?.completedLessons || [];
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      {/* 🔥 Pasamos el historial como prop adicional */}
      <CourseDetailView course={course} completedLessons={completedLessons} />
    </main>
  );
}
