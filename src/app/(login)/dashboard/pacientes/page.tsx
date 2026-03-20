// src/app/(login)/dashboard/pacientes/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { Users } from "lucide-react";
import PacientesTable from "@/components/dashboard/pacientes-table";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const sanityUserId = `user-${userId}`;

  // Consulta enriquecida: Traemos al niño y el historial de sus sesiones
  const query = `*[_type == "kidProfile" && parent._ref == $sanityUserId] | order(_createdAt desc) {
    _id,
    alias,
    activeAvatar,
    energyCrystals,
    "sessions": *[_type == "dailySession" && kidReference._ref == ^._id] | order(date desc) {
      date
    }
  }`;

  const rawKids = await client.fetch(
    query,
    { sanityUserId },
    { cache: "no-store", next: { revalidate: 0 } },
  );

  // Procesamos los datos para la tabla
  const kidsData = rawKids.map((kid: any) => {
    const totalSessions = kid.sessions?.length || 0;
    const lastAccess = totalSessions > 0 ? kid.sessions[0].date : null;

    return {
      _id: kid._id,
      alias: kid.alias,
      activeAvatar: kid.activeAvatar,
      energyCrystals: kid.energyCrystals || 0,
      totalSessions,
      lastAccess,
    };
  });

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-500" />
          Directorio de Pacientes
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Gestiona los perfiles, revisa su compromiso y edita sus
          configuraciones.
        </p>
      </div>

      {/* Renderizamos la tabla interactiva */}
      <PacientesTable initialKids={kidsData} />
    </div>
  );
}
