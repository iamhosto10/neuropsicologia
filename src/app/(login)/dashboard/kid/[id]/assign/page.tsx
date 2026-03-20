import { client } from "@/sanity/lib/client";
import { ArrowLeft, Puzzle } from "lucide-react";
import Link from "next/link";
import MissionAssigner from "@/components/dashboard/mission-assigner";

export const dynamic = "force-dynamic";

export default async function AssignMissionsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // Traemos todas las misiones disponibles directamente desde el servidor
  const missions = await client.withConfig({ useCdn: false }).fetch(
    `*[_type == "mission"] | order(_createdAt desc) {
      _id, title, gameType, difficulty
    }`,
    {},
    { cache: "no-store" },
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
          Selecciona las misiones terapéuticas que el cadete deberá completar
          hoy.
        </p>
      </div>

      {/* Aquí inyectamos el componente interactivo que creamos en el Paso 2 */}
      {missions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-slate-500">
            No hay misiones configuradas en la base de datos.
          </p>
        </div>
      ) : (
        <MissionAssigner kidId={id} missions={missions} />
      )}
    </div>
  );
}
