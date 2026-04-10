import { ArrowLeft, Puzzle } from "lucide-react";
import Link from "next/link";
import MissionAssigner from "@/components/dashboard/mission-assigner";
import { CLINICAL_DICTIONARY } from "@/lib/clinical-dictionary";

export const dynamic = "force-dynamic";

export default async function AssignMissionsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // Transformamos el diccionario en un array para que el Assigner lo pueda leer
  const availableGames = Object.entries(CLINICAL_DICTIONARY).map(
    ([key, data]) => ({
      gameType: key,
      title: data.title,
      domain: data.domain,
      description: data.description,
    }),
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href={`/dashboard/kid/${id}`}
        className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Reporte
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Puzzle className="text-cyan-500 w-8 h-8" /> Asignar Plan de
          Entrenamiento
        </h1>
        <p className="text-slate-500 mt-2">
          Selecciona la fecha y configura las misiones que el cadete deberá
          completar.
        </p>
      </div>

      {/* Le pasamos el catálogo de juegos. 
          NOTA: Tu componente MissionAssigner deberá tener un <DatePicker /> para escoger la fecha 
          y enviar los datos a un Server Action para crear el dailySession. */}
      <MissionAssigner kidId={id} availableGames={availableGames} />
    </div>
  );
}
