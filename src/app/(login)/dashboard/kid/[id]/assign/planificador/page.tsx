// src/app/(login)/dashboard/kid/[id]/assign/planificador/page.tsx
import { ArrowLeft, Puzzle } from "lucide-react";
import Link from "next/link";
import MissionAssigner from "@/components/dashboard/mission-assigner";
import { CLINICAL_DICTIONARY } from "@/lib/clinical-dictionary";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";

export default async function PlanificadorMisionesPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { date?: string };
}) {
  const { id } = await params;
  const { date } = await searchParams; // Si viene una fecha, estamos editando

  // 1. Transformamos el diccionario de juegos
  const availableGames = Object.entries(CLINICAL_DICTIONARY).map(
    ([key, data]) => ({
      gameType: key,
      title: data.title,
      domain: data.domain,
      description: data.description,
    }),
  );

  // 2. Si hay una fecha en la URL, buscamos si ya existe una sesión para pre-llenar
  let initialSessionData = null;
  if (date) {
    const existingSession = await client.fetch(
      `*[_type == "dailySession" && kidProfile._ref == $id && date == $date][0]{
        date,
        missions
      }`,
      { id, date },
      { cache: "no-store" }, // Evitamos caché para datos frescos
    );
    if (existingSession) {
      initialSessionData = existingSession;
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href={`/dashboard/kid/${id}/assign`}
        className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-semibold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la Agenda
      </Link>

      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Puzzle className="text-cyan-500 w-8 h-8" />
          {initialSessionData ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
        </h1>
        <p className="text-slate-500 mt-2">
          {initialSessionData
            ? `Modificando las misiones para la fecha: ${date}`
            : "Selecciona la fecha y configura las misiones que el cadete deberá completar."}
        </p>
      </div>

      {/* Le pasamos los datos iniciales al Assigner (si existen) */}
      <MissionAssigner
        kidId={id}
        availableGames={availableGames}
        initialData={initialSessionData}
      />
    </div>
  );
}
