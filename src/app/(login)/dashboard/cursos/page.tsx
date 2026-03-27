// src/app/(login)/dashboard/cursos/page.tsx
import { BookOpen, PlusCircle, Pencil } from "lucide-react"; // 🔥 Añadimos Pencil
import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import CoursesCard from "@/components/courses/courses-card";
import AssignButton from "@/components/dashboard/assign-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MisCursosPage() {
  const { userId } = await auth();
  const sanityUserId = `user-${userId}`;

  // 1. Traemos todos los cursos de Sanity
  const queryCourses = `*[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    level,
    "image": image.asset->url
  }`;
  const courses = await client
    .withConfig({ useCdn: false })
    .fetch(queryCourses);

  // 2. Traemos a los cadetes que pertenecen a este padre/terapeuta
  const queryKids = `*[_type == "kidProfile" && parent._ref == $sanityUserId] {
    _id, 
    alias
  }`;
  const kids = await client
    .withConfig({ useCdn: false })
    .fetch(queryKids, { sanityUserId });

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      {/* CABECERA CON BOTÓN DE CREAR */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-500" />
            Biblioteca de la Academia
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Explora los módulos educativos disponibles y asígnalos a tus
            cadetes.
          </p>
        </div>

        <Button
          asChild
          className="shrink-0 h-12 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20"
        >
          <Link href="/dashboard/cursos/nuevo">
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear Nuevo Curso
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-slate-500 mb-4">
            No hay cursos disponibles en la plataforma por ahora.
          </p>
          <Button
            asChild
            variant="outline"
            className="rounded-xl font-bold text-cyan-600 border-cyan-200 hover:bg-cyan-50"
          >
            <Link href="/dashboard/cursos/nuevo">
              Sé el primero en crear uno
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CoursesCard
              key={course._id}
              title={course.title}
              description={course.description}
              image={course.image}
              href={`/cursos/${course.slug}`} // Esto sigue llevando a la vista pública del curso
              level={course.level}
              // 🔥 EL ACTION SLOT AHORA TIENE 2 BOTONES
              actionSlot={
                <div className="flex items-center gap-2 w-full mt-2">
                  {/* Botón de Editar (Constructor) */}
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 font-bold"
                  >
                    <Link href={`/dashboard/cursos/${course._id}/editar`}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </Button>

                  {/* Botón de Asignar (Solo si hay cadetes) */}
                  {kids.length > 0 && (
                    <div className="flex-1">
                      <AssignButton
                        kids={kids}
                        itemId={course._id}
                        itemType="course"
                      />
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
