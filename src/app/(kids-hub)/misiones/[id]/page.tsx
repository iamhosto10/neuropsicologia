// src/app/(kids-hub)/misiones/[id]/page.tsx
import { client } from "@/sanity/lib/client";
import { notFound, redirect } from "next/navigation";
import AsteroidFieldGame from "@/components/games/asteroid-field-game";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getActiveKidId } from "@/app/actions/profile.actions";

import MemoryMatrixGame from "@/components/games/memory-matrix-game";
import MultitaskEvasionGame from "@/components/games/multitask-evasion-game";
import ReverseCommunicatorGame from "@/components/games/reverse-communicator-game";
import SatelliteTrackerGame from "@/components/games/satellite-tracker-game";
import SpaceCleanupGame from "@/components/games/space-cleanup-game";
import CargoLaboratoryGame from "@/components/games/cargo-laboratory-game";
import NebulaStormGame from "@/components/games/nebula-storm-game";
import SignalDecoderGame from "@/components/games/signal-decoder-game";
import NavigationGame from "@/components/games/navigation-game";

const getMissionQuery = `*[_type == "mission" && _id == $id][0]`;

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const kidId = (await getActiveKidId()) + "";

  const { id } = await params;
  console.log("Cargando misión con ID:", id);

  const mission = await client.fetch(getMissionQuery, { id });

  if (!mission) {
    notFound();
  }

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
          <AsteroidFieldGame
            config={{
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "simon_says_reverse" && (
          <MemoryMatrixGame
            config={{
              title: mission.title,
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "multitask_evasion" && (
          <MultitaskEvasionGame
            config={{
              title: mission.title,
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "reverse_communicator" && (
          <ReverseCommunicatorGame
            config={{
              title: mission.title,
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "satellite_tracker" && (
          <SatelliteTrackerGame
            config={{
              title: mission.title,
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}

        {mission.gameType === "space_cleanup" && (
          <SpaceCleanupGame
            config={{
              title: mission.title,
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "cargo_n_back" && (
          <CargoLaboratoryGame
            config={{
              title: mission.title,
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "nebula_storm" && (
          <NebulaStormGame
            config={{
              title: mission.title,
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 30,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "signal_decoder" && (
          <SignalDecoderGame
            config={{
              title: mission.title,
              duration: mission.timeLimit ?? 10,
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
        {mission.gameType === "navigation" && (
          <NavigationGame
            config={{
              difficulty: mission.difficulty,
              duration: mission.timeLimit ?? 120, // Le damos 120s por defecto porque requiere pensar
              kidId: kidId,
              missionId: id,
              energyReward: mission.energyReward,
            }}
          />
        )}
      </div>
    </div>
  );
}
