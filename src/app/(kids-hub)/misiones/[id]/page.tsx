// src/app/(kids-hub)/misiones/[id]/page.tsx
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import AsteroidFieldGame from "@/components/games/asteroid-field-game";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Consulta para obtener la configuración de la misión
const getMissionQuery = `*[_type == "mission" && _id == $id][0]`;

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const TEST_KID_ID = "a5a34e5b-625e-4229-9aed-21ac9cf9bb22";
  const { id } = await params;

  // 1. Buscamos la misión en la base de datos
  const mission = await client.fetch(getMissionQuery, { id });

  // Si alguien pone una URL falsa, mostramos error 404
  if (!mission) {
    notFound();
  }

  // 2. Renderizamos el juego correcto según el 'gameType' de Sanity
  return (
    <div className="w-full h-full flex flex-col relative animate-in fade-in duration-700">
      {/* Botón de escape sutil (Por si el niño necesita salir o se frustra) */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/hq"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Abortar Misión
          </span>
        </Link>
      </div>

      {/* Renderizador de Motores de Juego */}
      <div className="flex-1 flex items-center justify-center">
        {mission.gameType === "asteroids_go_nogo" && (
          <AsteroidFieldGame
            config={{
              difficulty: mission.difficulty,
              duration: 10, // Podrías también traer esto de Sanity en el futuro
              kidId: TEST_KID_ID,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}

        {/* Aquí en el futuro añadirás los otros juegos */}
        {mission.gameType === "emotion_faces" && (
          <div className="text-white text-2xl">
            Constructor de Caras (Próximamente)
          </div>
        )}

        {mission.gameType === "simon_says_reverse" && (
          <div className="text-white text-2xl">
            Secuencia Inversa (Próximamente)
          </div>
        )}
      </div>
    </div>
  );
}
