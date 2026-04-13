"use client";

import { useState } from "react";
import { Gamepad2, X, Maximize, Minimize, FlaskConical } from "lucide-react";

import SpaceCleanupGame from "@/components/games/space-cleanup-game";
import SatelliteTrackerGame from "@/components/games/satellite-tracker-game";
import AsteroidFieldGame from "@/components/games/asteroid-field-game";
import ReverseCommunicatorGame from "@/components/games/reverse-communicator-game";
import MemoryMatrixGame from "@/components/games/memory-matrix-game";
import MultitaskEvasionGame from "@/components/games/multitask-evasion-game";
import CargoLaboratoryGame from "../games/cargo-laboratory-game";
import NebulaStormGame from "../games/nebula-storm-game";
import SignalDecoderGame from "../games/signal-decoder-game";
import NavigationGame from "../games/navigation-game";
import WarpDriveGame from "../games/warp-drive-game";
import config from "../../../sanity.config";

export default function InlineGameWrapper({ value }: { value: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); // 🔥 Nuevo estado para Pantalla Completa

  const { gameType, title, difficulty, duration, instruction } = value;

  if (!isPlaying) {
    return (
      <div className="my-12 bg-linear-to-br from-cyan-500 to-blue-600 p-8 md:p-12 rounded-3xl text-center text-white shadow-xl shadow-cyan-500/20 transition-transform hover:-translate-y-1">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gamepad2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-black mb-3">
          {title || "Módulo Interactivo"}
        </h3>
        <p className="text-cyan-100 mb-8 text-lg max-w-xl mx-auto">
          {instruction ||
            "Pon a prueba la teoría de esta lección con un ejercicio práctico."}
        </p>
        <button
          onClick={() => setIsPlaying(true)}
          className="bg-white text-cyan-600 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 hover:shadow-lg hover:shadow-white/20 transition-all"
        >
          Iniciar Ejercicio
        </button>
      </div>
    );
  }

  // 🔥 Le pasamos una bandera especial (isPractice: true) a tus juegos
  const gameConfig = {
    title: title || "Laboratorio",
    difficulty: difficulty || "easy",
    duration: 30,
    kidId: "practice-mode",
    missionId: `practice-${Math.random()}`,
    energyReward: 0,
    isPractice: true,
  };

  const renderGameEngine = () => {
    switch (gameType) {
      case "cleanup":
        return <SpaceCleanupGame config={gameConfig} />;
      case "satellite":
        return <SatelliteTrackerGame config={gameConfig} />;
      case "asteroid":
        return <AsteroidFieldGame config={gameConfig} />;
      case "reverse":
        return <ReverseCommunicatorGame config={gameConfig} />;
      case "memori":
        return <MemoryMatrixGame config={gameConfig} />;
      case "multitask":
        return <MultitaskEvasionGame config={gameConfig} />;
      case "cargo_n_back":
        return <CargoLaboratoryGame config={gameConfig} />;
      case "nebula_storm":
        return <NebulaStormGame config={gameConfig} />;
      case "signal_decoder":
        return <SignalDecoderGame config={gameConfig} />;
      case "navigation":
        return <NavigationGame config={gameConfig} />;
      case "warp_drive":
        return <WarpDriveGame config={gameConfig} />;
      default:
        return <SpaceCleanupGame config={gameConfig} />;
    }
  };

  // Dependiendo del estado, usamos unas clases CSS normales, o las de pantalla completa (fixed inset-0)
  const wrapperClasses = isFullscreen
    ? "fixed inset-0 z-[100] bg-slate-950 flex flex-col w-screen h-screen animate-in fade-in zoom-in-95 duration-300"
    : "my-12 relative border-4 border-slate-900 rounded-[2.5rem] overflow-hidden bg-slate-950 min-h-[600px] shadow-2xl transition-all duration-500";

  return (
    <div className={wrapperClasses}>
      {/* Controles Superiores (Pantalla Completa y Cerrar) */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors shadow-sm"
          title={isFullscreen ? "Minimizar" : "Pantalla Completa"}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            setIsFullscreen(false);
          }}
          className="bg-white/10 hover:bg-red-500 text-white p-3 rounded-full backdrop-blur-md transition-colors group flex items-center gap-2 shadow-sm"
        >
          <X className="w-5 h-5" />
          <span className="hidden group-hover:block font-bold pr-2 text-sm">
            Cerrar Laboratorio
          </span>
        </button>
      </div>

      {/* Etiqueta de Laboratorio más sutil */}
      <div className="absolute top-6 left-6 z-50 bg-cyan-500/90 text-slate-950 px-4 py-2 rounded-full backdrop-blur-md font-bold text-xs flex items-center gap-2 shadow-lg tracking-wider uppercase">
        <FlaskConical className="w-4 h-4" /> Laboratorio
      </div>

      <div className="flex-1 w-full h-full relative">{renderGameEngine()}</div>
    </div>
  );
}
