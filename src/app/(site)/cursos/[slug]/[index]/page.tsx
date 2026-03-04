// import { LessonViewV2 } from "@/components/lesson-detail-v2/lesson-view-v2";
// import LessonViewV3 from "@/components/lesson-detail-v3/lesson-view-v3";
// import { LessonView } from "@/components/lesson-detail/lesson-view";

// const page = () => {
//   return (
//     <>
//       {/* esta sera la leccion estilo 1 */}
//       <LessonView  />
//       {/* esta sera la leccion estilo 2 */}
//       {/* <LessonViewV2 /> */}
//       {/* <LessonViewV3 /> */}
//     </>
//   );
// };

// export default page;

import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { GET_LESSON_BY_SLUG } from "@/sanity/lib/queries";
import { LessonView } from "@/components/lesson-detail/lesson-view";

// Definimos que esta página es dinámica (se renderiza en el servidor cada vez o usa ISR)
export const revalidate = 60; // Revalidar cada 60 segundos (opcional)

interface LessonPageProps {
  params: {
    slug: string; // El slug del curso (ej: "curso-atencion")
    index: string; // El slug de la lección (ej: "leccion-1-filtrando-basura")
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  // 1. OBTENER LOS PARÁMETROS DE LA URL
  // Ojo: En tu estructura de carpetas, [index] parece ser el slug de la lección.
  // Si tu URL es algo como /cursos/curso-1/leccion-5, entonces params.index = "leccion-5"
  const { index: lessonSlug } = params;

  // 2. PEDIR DATOS A SANITY
  // Usamos la query que creamos en el Paso 1
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
  return <LessonView lesson={lesson} />;
}
