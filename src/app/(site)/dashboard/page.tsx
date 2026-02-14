import { auth, currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { GET_USER_BY_CLERK_ID } from "@/sanity/lib/queries";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function DashboardPage() {
  // 1. Obtenemos la sesión de Clerk
  const { userId } = await auth();
  const userClerk = await currentUser();

  // Si no hay usuario, mandamos al login (aunque el middleware ya debería proteger esto)
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Buscamos los datos extendidos en Sanity
  // Le pasamos el userId de Clerk a la query
  const sanityUser = await client.fetch(GET_USER_BY_CLERK_ID, {
    clerkId: userId,
  });

  // 3. Renderizamos la vista
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Encabezado de Bienvenida */}
      <div className="flex items-center gap-6 mb-10 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hola, {sanityUser?.name || userClerk?.firstName} 👋
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-500">
              {userClerk?.emailAddresses[0]?.emailAddress}
            </span>
            {/* Badge de Membresía basado en Sanity */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                sanityUser?.role === "premium"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {sanityUser?.role === "premium"
                ? "Plan Premium 💎"
                : "Plan Gratuito"}
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Contenido según el Plan */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tarjeta de Progreso */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Mis Cursos</h2>
          {sanityUser?.completedCourses?.length > 0 ? (
            <ul className="space-y-2">
              {sanityUser.completedCourses.map((course: any) => (
                <li
                  key={course.slug.current}
                  className="flex items-center text-green-700"
                >
                  ✅ {course.title}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">
                Aún no has completado cursos.
              </p>
              <a
                href="/cursos"
                className="text-indigo-600 hover:underline text-sm"
              >
                Explorar catálogo →
              </a>
            </div>
          )}
        </div>

        {/* Tarjeta de Estado de Cuenta */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Estado de la cuenta</h2>

          {sanityUser?.role === "free" ? (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-blue-800 text-sm mb-3">
                Estás en el plan básico. Accede a material exclusivo
                actualizando tu cuenta.
              </p>
              <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Actualizar a Premium
              </button>
            </div>
          ) : (
            <div className="text-green-600">
              <p>
                ¡Gracias por ser un miembro Premium! Tienes acceso ilimitado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
