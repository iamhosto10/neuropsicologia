// src/components/games/multitask-evasion-game.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import {
  Rocket,
  ShieldAlert,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Battery,
  Package,
  ServerCrash,
} from "lucide-react";
import useSound from "use-sound";
import { useMultitaskEngine } from "@/hooks/useMultitaskEngine";

interface MultitaskGameProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
  };
}

export default function MultitaskEvasionGame({ config }: MultitaskGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // --- AUDIO ---
  const [playBg, { stop: stopBg }] = useSound("/sounds/bg-warp.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playGood] = useSound("/sounds/collect-good.mp3", { volume: 0.7 });
  const [playBad] = useSound("/sounds/collect-bad.mp3", { volume: 0.7 });
  const [playCrash] = useSound("/sounds/wall-crash.mp3", { volume: 0.6 });

  // --- EFECTOS VISUALES ---
  const triggerShake = () => {
    const container = document.getElementById("warp-viewport");
    if (container) {
      container.classList.add("animate-shake", "bg-red-900/40");
      setTimeout(
        () => container.classList.remove("animate-shake", "bg-red-900/40"),
        300,
      );
    }
  };

  // --- CONEXIÓN AL MOTOR ---
  const engine = useMultitaskEngine({
    duration: config.duration || 60,
    difficulty: config.difficulty || "medium",
    onPlayGood: () => {
      if (soundEnabled) playGood();
    },
    onPlayBad: () => {
      if (soundEnabled) playBad();
    },
    onPlayCrash: () => {
      if (soundEnabled) playCrash();
    },
    onTriggerShake: triggerShake,
    onFinish: async (finalScore, telemetry) => {
      stopBg();
      if (config.isPractice) return;

      // 🔥 Candado Visual INMEDIATO
      setIsSaving(true);

      console.log("Telemetría Clínica (Multitask):", telemetry);
      await saveMissionProgress(
        config.kidId,
        config.missionId,
        config.energyReward,
        telemetry,
      );
      router.push("/hq");
    },
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newVal = !prev;
      if (newVal && engine.gameState === "playing") playBg();
      if (!newVal) stopBg();
      return newVal;
    });
  };

  const handleStart = () => {
    if (soundEnabled) playBg();
    engine.startGame();
  };

  // Puente entre el evento de React y la matemática del Engine
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (engine.gameState !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    engine.handlePointerMove(xPercentage);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors hidden sm:block shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <div className="flex-1 w-full">
            <div className="flex justify-between text-xs text-slate-400 uppercase mb-1">
              <span className="flex items-center gap-1">
                <Battery className="w-3 h-3" /> Escudos
              </span>
              <span>{engine.health}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 w-full">
              <div
                className={`h-full transition-all duration-300 ${engine.health > 50 ? "bg-green-500" : engine.health > 20 ? "bg-yellow-500" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`}
                style={{ width: `${engine.health}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200 text-center">
          {Math.floor(engine.timeLeft / 60)}:
          {(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3 flex flex-col items-end">
          <div className="text-xs text-slate-400 uppercase flex items-center gap-1">
            <Package className="w-3 h-3" /> Carga:{" "}
            <span className="text-cyan-400 font-bold ml-1">{engine.cargo}</span>
          </div>
          <div className="text-xl font-mono text-cyan-400 mt-1">
            {engine.score} PTS
          </div>
        </div>
      </div>

      {/* REGLA COGNITIVA */}
      {engine.gameState === "playing" && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 bg-black/80 border border-cyan-500/50 px-6 py-2 rounded-full backdrop-blur-sm pointer-events-none w-max shadow-xl">
          <p className="text-white font-bold tracking-widest uppercase text-sm sm:text-base">
            Atrapa SOLO{" "}
            <span
              className={
                engine.targetRule === "even"
                  ? "text-green-400"
                  : "text-purple-400"
              }
            >
              {engine.targetRule === "even"
                ? "PARES (2,4,6...)"
                : "IMPARES (1,3,5...)"}
            </span>
          </p>
        </div>
      )}

      {/* VIEWPORT (DOM ENGINE) */}
      <div
        id="warp-viewport"
        onPointerMove={onPointerMove}
        className="relative h-150 w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl cursor-crosshair touch-none"
      >
        {/* Fondo Parallax */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(transparent 50%, rgba(6,182,212,0.1) 50%)",
            backgroundSize: "100% 40px",
          }}
        >
          {engine.gameState === "playing" && (
            <div
              className="absolute inset-0 animate-[slide-down_3s_linear_infinite]"
              style={{
                backgroundImage:
                  "linear-gradient(transparent 50%, rgba(6,182,212,0.2) 50%)",
                backgroundSize: "100% 80px",
              }}
            />
          )}
        </div>

        {/* 🔥 LA LÓGICA DE RENDERIZADO EXCLUSIVO (Candado Visual) */}
        {isSaving ? (
          <div className="absolute inset-0 z-100 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
            <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <ServerCrash className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-cyan-400 font-bold text-3xl animate-pulse tracking-widest text-center">
              Guardando Progreso...
            </p>
            <p className="text-slate-400 mt-4 text-sm font-mono uppercase text-center">
              Sincronizando Bitácora Clínica.
            </p>
          </div>
        ) : engine.gameState !== "playing" ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center pointer-events-auto animate-in fade-in duration-300">
            {engine.gameState === "finished" ? (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <h2
                  className={`text-4xl font-bold ${engine.health <= 0 ? "text-red-500" : "text-cyan-400"}`}
                >
                  {engine.health <= 0
                    ? "¡NAVE DESTRUIDA!"
                    : "¡VIAJE COMPLETADO!"}
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600">
                  <p className="text-slate-400 mb-2">Puntaje Operativo</p>
                  <p className="text-5xl font-mono text-cyan-300">
                    {engine.score}
                  </p>
                  <p className="text-sm text-slate-400 mt-4">
                    Carga recuperada: {engine.cargo} paquetes correctos
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl disabled:opacity-50"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Nuevo Intento
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                  <Rocket className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "La Gran Evasión"}
                </h2>
                <div className="text-left bg-slate-800/50 p-6 rounded-xl space-y-4 border border-slate-700">
                  <p className="text-slate-300 text-sm sm:text-base">
                    Mueve el ratón para pilotar.
                  </p>
                  <div className="flex items-center gap-4 bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                    <span className="text-slate-300 text-sm">
                      Esquiva las{" "}
                      <strong className="text-red-400">Paredes Rojas</strong>.
                    </span>
                  </div>
                  <div className="flex items-center gap-4 bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30">
                    <div className="w-6 h-6 rounded-full border border-cyan-400 flex items-center justify-center shrink-0">
                      <span className="text-xs text-cyan-400 font-bold">#</span>
                    </div>
                    <span className="text-slate-300 text-sm">
                      El radar te pedirá{" "}
                      <strong className="text-cyan-400">Pares o Impares</strong>
                      . Atrapa solo los correctos.
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Play className="mr-2 h-5 w-5" /> DESPEGAR
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* OBJETOS FÍSICOS */}
            {engine.objects.map((obj) => {
              if (!obj.visible) return null;

              return (
                <div
                  key={obj.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
                    width: `${obj.width}%`,
                    height: `${obj.height}%`,
                  }}
                >
                  {obj.type === "number" ? (
                    <div className="w-full h-full bg-slate-800/90 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                      <span className="text-lg sm:text-xl font-bold text-white font-mono">
                        {obj.value}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-red-500/80 border-2 border-red-400 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.6)] flex items-center justify-center overflow-hidden">
                      <div className="w-full h-1 bg-white/50 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* JUGADOR (NAVE) */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${engine.renderShipX}%`,
                top: `${engine.PLAYER_Y}%`,
                width: `${engine.PLAYER_WIDTH}%`,
                height: `${engine.PLAYER_HEIGHT}%`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute -bottom-4 w-4 h-6 bg-orange-500 blur-sm rounded-full animate-pulse" />
                {config.targetImage ? (
                  <img
                    src={config.targetImage}
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                    alt="Nave"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 border-2 border-cyan-400 rounded-t-full rounded-b-xl flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <Rocket className="w-6 h-6 text-cyan-300" />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slide-down {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100px); }
        }
      `,
        }}
      />
    </div>
  );
}
