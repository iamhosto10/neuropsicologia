import { client } from "@/sanity/lib/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AsteroidFieldGame from "@/components/games/asteroid-field-game";
import MemoryMatrixGame from "@/components/games/memory-matrix-game";
import MultitaskEvasionGame from "@/components/games/multitask-evasion-game";
import ReverseCommunicatorGame from "@/components/games/reverse-communicator-game";
import SatelliteTrackerGame from "@/components/games/satellite-tracker-game";
import SpaceCleanupGame from "@/components/games/space-cleanup-game";
import CargoLaboratoryGame from "@/components/games/cargo-laboratory-game";
import NebulaStormGame from "@/components/games/nebula-storm-game";
import SignalDecoderGame from "@/components/games/signal-decoder-game";
import NavigationGame from "@/components/games/navigation-game";
import WarpDriveGame from "@/components/games/warp-drive-game";

// 🔥 LA MAGIA: Buscamos la sesión que contenga una misión con este _key específico
const getMissionByKeyQuery = `
  *[_type == "dailySession" && $id in missions[]._key][0]{
    "kidId": kidProfile._ref,
    "mission": missions[_key == $id][0]
  }
`;

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // id = el _key del objeto
  const data = await client.fetch(
    getMissionByKeyQuery,
    { id },
    { cache: "no-store" },
  );

  if (!data || !data.mission) notFound();

  const { kidId, mission } = data;

  // Configuramos el objeto maestro que reciben todos los juegos
  const gameConfig = {
    title: mission.title || "Misión Terapéutica",
    difficulty: mission.difficulty || "medium",
    duration: mission.timeLimit ?? 60,
    kidId: kidId,
    missionId: id, // Seguimos pasando el _key para que el Server Action sepa cuál completar
    energyReward: mission.energyReward ?? 50,
  };

  return (
    <div className="w-full h-full flex flex-col relative animate-in fade-in duration-700">
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

      <div className="flex-1 flex items-center justify-center">
        {mission.gameType === "asteroids_go_nogo" && (
          <AsteroidFieldGame config={gameConfig} />
        )}
        {mission.gameType === "simon_says_reverse" && (
          <MemoryMatrixGame config={gameConfig} />
        )}
        {mission.gameType === "multitask_evasion" && (
          <MultitaskEvasionGame config={gameConfig} />
        )}
        {mission.gameType === "reverse_communicator" && (
          <ReverseCommunicatorGame config={gameConfig} />
        )}
        {mission.gameType === "satellite_tracker" && (
          <SatelliteTrackerGame config={gameConfig} />
        )}
        {mission.gameType === "space_cleanup" && (
          <SpaceCleanupGame config={gameConfig} />
        )}
        {mission.gameType === "cargo_n_back" && (
          <CargoLaboratoryGame config={gameConfig} />
        )}
        {mission.gameType === "nebula_storm" && (
          <NebulaStormGame config={gameConfig} />
        )}
        {mission.gameType === "signal_decoder" && (
          <SignalDecoderGame config={gameConfig} />
        )}
        {mission.gameType === "navigation" && (
          <NavigationGame config={gameConfig} />
        )}
        {mission.gameType === "warp_drive" && (
          <WarpDriveGame config={gameConfig} />
        )}
      </div>
    </div>
  );
}
