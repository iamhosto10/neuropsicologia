// src/app/(login)/dashboard/cursos/[courseId]/editar/page.tsx
import { client } from "@/sanity/lib/client";
import { redirect } from "next/navigation";
import EditCourseForm from "./edit-course-form";

export const dynamic = "force-dynamic";

export default async function EditarCursoPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = await params;

  // Traemos los datos básicos del curso
  const query = `*[_type == "course" && _id == $courseId][0]{
    _id, title, description, level, duration, age,
    "image": image.asset->url
  }`;

  const course = await client
    .withConfig({ useCdn: false })
    .fetch(query, { courseId });

  if (!course) {
    redirect("/dashboard/cursos");
  }

  return <EditCourseForm course={course} />;
}
