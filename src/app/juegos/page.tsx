import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { GET_LESSON_BY_SLUG } from "@/sanity/lib/queries";

import { TestGames } from "@/components/testgames/TestGames";

export default async function Page() {
  const lesson = await client.fetch(GET_LESSON_BY_SLUG, {
    slug: "que-es-la-alegria", // Aquí deberías usar lessonSlug, pero lo dejo fijo para pruebas
  });

  // 3. MANEJAR EL CASO "NO ENCONTRADO"
  // Si Sanity no devuelve nada, mostramos la página 404 de Next.js
  if (!lesson) {
    notFound();
  }

  // 4. PASAR DATOS AL COMPONENTE VISUAL
  // Aquí es donde conectamos el Backend (Sanity) con el Frontend (LessonView)
  return <TestGames lesson={lesson} />;
}
