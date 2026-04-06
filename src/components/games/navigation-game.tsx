// src/components/games/navigation-game.tsx
"use client";

import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Delete,
  Rocket,
  Flag,
  AlertOctagon,
  RotateCcw,
  Flame,
  Volume2,
  VolumeX,
  ServerCrash,
  Map,
  Star,
} from "lucide-react";
import useSound from "use-sound";
import { useNavigationEngine, Direction } from "@/hooks/useNavigationEngine";

interface NavigationGameProps {
  config: {
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
  };
}

export default function NavigationGame({ config }: NavigationGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [playBackground, { stop: stopBackground }] = useSound(
    "/sounds/ambient-space.mp3",
    { loop: true, volume: 0.3 },
  );
  const [playMove] = useSound("/sounds/beep-light.mp3", { volume: 0.5 });
  const [playCrash] = useSound("/sounds/error-buzz.mp3", { volume: 0.4 });
  const [playWin] = useSound("/sounds/combo-powerup.mp3", { volume: 0.6 }); // Sonido más épico al pasar de mundo

  const engine = useNavigationEngine({
    duration: config.duration || 120,
    difficulty: config.difficulty || "medium",
    onLevelComplete: (combo) => {
      if (soundEnabled) playWin();
    },
    onCrash: () => {
      if (soundEnabled) playCrash();
    },
    onFinish: async (finalScore, telemetry) => {
      stopBackground();
      if (config.isPractice) return;

      setIsSaving(true);
      console.log("Telemetría Planificación Clínica:", telemetry);

      await saveMissionProgress(
        config.kidId,
        config.missionId,
        config.energyReward,
        telemetry,
      );
      router.push("/hq");
    },
  });

  const handleStart = () => {
    if (soundEnabled) playBackground();
    engine.startGame();
  };

  const handleAddCommand = (dir: Direction) => {
    if (soundEnabled) playMove();
    engine.addCommand(dir);
  };

  const renderCommandIcon = (cmd: Direction) => {
    switch (cmd) {
      case "UP":
        return <ArrowUp className="w-5 h-5" />;
      case "DOWN":
        return <ArrowDown className="w-5 h-5" />;
      case "LEFT":
        return <ArrowLeft className="w-5 h-5" />;
      case "RIGHT":
        return <ArrowRight className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center z-20 relative shadow-lg">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (soundEnabled) stopBackground();
              else if (
                engine.gameState !== "start" &&
                engine.gameState !== "finished"
              )
                playBackground();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* 🔥 INDICADOR DEL MUNDO ACTUAL */}
          {(engine.gameState === "playing" ||
            engine.gameState === "executing" ||
            engine.gameState === "level-passed") && (
            <div className="flex items-center gap-2 text-indigo-400 font-bold bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-600/50">
              <Map className="w-4 h-4" />{" "}
              <span>Sector {engine.levelIndex + 1}</span>
            </div>
          )}

          {engine.combo > 1 && (
            <div className="flex items-center gap-2 text-yellow-400 font-bold bg-yellow-900/30 px-3 py-1 rounded-lg border border-yellow-600/50">
              <Flame className="w-5 h-5 fill-yellow-500" />{" "}
              <span>x{engine.combo}</span>
            </div>
          )}
        </div>
        <div className="text-3xl font-mono font-bold text-slate-200">
          {Math.floor(engine.timeLeft / 60)
            .toString()
            .padStart(2, "0")}
          :{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <div className="text-right w-1/3">
          <p className="text-2xl font-mono text-cyan-400">{engine.score} PTS</p>
        </div>
      </div>

      {/* VIEWPORT DEL JUEGO */}
      <div className="relative flex flex-col md:flex-row h-125 w-full bg-black overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl">
        {/* ZONA DE JUEGO (GRILLA) */}
        <div className="flex-1 flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={engine.levelIndex} // 🔥 Esto anima la entrada de un nuevo tablero
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="grid gap-1 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${engine.levelConfig.size}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: engine.levelConfig.size }).map((_, y) =>
                Array.from({ length: engine.levelConfig.size }).map((_, x) => {
                  const isRover =
                    engine.roverPos.x === x && engine.roverPos.y === y;
                  const isEnd =
                    engine.levelConfig.end.x === x &&
                    engine.levelConfig.end.y === y;
                  const isObstacle = engine.levelConfig.obstacles.some(
                    (obs) => obs.x === x && obs.y === y,
                  );

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center transition-all duration-300
                      ${isObstacle ? "bg-red-900/40 border border-red-500/50" : "bg-slate-800 border border-slate-700"}
                      ${isEnd && !isRover ? "bg-emerald-900/40 border border-emerald-500/50 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]" : ""}
                    `}
                    >
                      {isObstacle && (
                        <AlertOctagon className="text-red-500/30 w-6 h-6" />
                      )}
                      {isEnd && !isRover && (
                        <Flag className="text-emerald-400 w-6 h-6" />
                      )}
                      {isRover && (
                        <motion.div
                          layoutId="rover"
                          className="z-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                        >
                          <Rocket className="w-8 h-8 text-sky-400" />
                        </motion.div>
                      )}
                    </div>
                  );
                }),
              )}
            </motion.div>
          </AnimatePresence>

          {/* 🔥 ANIMACIÓN DE TRANSICIÓN ENTRE MUNDOS 🔥 */}
          {engine.gameState === "level-passed" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-emerald-950/90 backdrop-blur-sm"
            >
              <Star
                className="text-yellow-400 w-24 h-24 mb-4 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                fill="currentColor"
              />
              <h2 className="text-4xl font-black text-white tracking-widest drop-shadow-md">
                ¡ZONA ASEGURADA!
              </h2>
              <p className="text-emerald-200 font-medium mt-2 text-lg">
                Viajando al sector {engine.levelIndex + 2}...
              </p>
            </motion.div>
          )}
        </div>

        {/* PANEL LATERAL DE COMANDOS */}
        <div className="w-full md:w-64 bg-slate-950 border-l-4 border-slate-800 p-4 flex flex-col z-40">
          <h3 className="text-sky-400 font-bold mb-2 text-center uppercase tracking-widest text-sm">
            Secuencia
          </h3>

          <div className="flex-1 bg-slate-900 rounded-lg p-2 border border-slate-800 flex flex-wrap content-start gap-1 overflow-y-auto mb-4">
            {engine.commands.length === 0 ? (
              <p className="text-slate-600 text-xs w-full text-center mt-4">
                Usa las flechas para programar la ruta
              </p>
            ) : (
              engine.commands.map((cmd, i) => (
                <div
                  key={i}
                  className="bg-sky-900/50 text-sky-300 w-8 h-8 flex items-center justify-center rounded"
                >
                  {renderCommandIcon(cmd)}
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 mb-4">
            <div />
            <Button
              disabled={engine.gameState !== "playing"}
              variant="secondary"
              className="h-12 bg-slate-800 text-white hover:bg-sky-700"
              onClick={() => handleAddCommand("UP")}
            >
              <ArrowUp />
            </Button>
            <div />
            <Button
              disabled={engine.gameState !== "playing"}
              variant="secondary"
              className="h-12 bg-slate-800 text-white hover:bg-sky-700"
              onClick={() => handleAddCommand("LEFT")}
            >
              <ArrowLeft />
            </Button>
            <Button
              disabled={engine.gameState !== "playing"}
              variant="secondary"
              className="h-12 bg-slate-800 text-white hover:bg-sky-700"
              onClick={() => handleAddCommand("DOWN")}
            >
              <ArrowDown />
            </Button>
            <Button
              disabled={engine.gameState !== "playing"}
              variant="secondary"
              className="h-12 bg-slate-800 text-white hover:bg-sky-700"
              onClick={() => handleAddCommand("RIGHT")}
            >
              <ArrowRight />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={
                engine.gameState !== "playing" || engine.commands.length === 0
              }
              className="h-10 w-12 bg-red-900 hover:bg-red-800"
              onClick={engine.removeLastCommand}
            >
              <Delete />
            </Button>
            <Button
              disabled={
                engine.gameState !== "playing" || engine.commands.length === 0
              }
              className="flex-1 h-10 bg-sky-600 hover:bg-sky-500 font-bold"
              onClick={engine.executeSequence}
            >
              EJECUTAR
            </Button>
          </div>
        </div>

        {/* PANTALLAS PRINCIPALES Y CANDADO VISUAL */}
        {isSaving ? (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
            <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <ServerCrash className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-cyan-400 font-bold text-3xl animate-pulse tracking-widest text-center">
              Guardando Progreso...
            </p>
            <p className="text-slate-400 mt-4 text-sm font-mono uppercase text-center">
              Sincronizando Bitácora Ejecutiva.
            </p>
          </div>
        ) : engine.gameState === "start" || engine.gameState === "finished" ? (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 text-white p-8 text-center animate-in fade-in duration-300 pointer-events-auto">
            {engine.gameState === "finished" ? (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-cyan-400">
                  ¡Tiempo Agotado!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                  <p className="text-slate-400 mb-2">
                    Puntaje Final de Planificación
                  </p>
                  <p className="text-6xl font-mono text-cyan-300">
                    {engine.score}
                  </p>
                  <p className="text-indigo-400 font-medium mt-4">
                    Sectores Asegurados:{" "}
                    {engine.levelIndex -
                      (config.difficulty === "hard"
                        ? 4
                        : config.difficulty === "medium"
                          ? 2
                          : 0)}
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Reintentar Misión
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-4xl font-bold text-white mb-2">
                  Ruta de Navegación
                </h2>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-inner">
                  <p className="text-slate-300 text-lg mx-auto leading-relaxed">
                    Programa la ruta exacta para que el Rover alcance la bandera
                    verde evitando los cráteres rojos.
                    <br />
                    <br />
                    <strong className="text-yellow-400 block mt-2 text-xl">
                      PIENSA ANTES DE ACTUAR.
                    </strong>
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-sky-600 hover:bg-sky-500 text-xl px-10 py-8 rounded-2xl shadow-[0_0_20px_rgba(2,132,199,0.4)] w-full transform hover:scale-105 transition-all font-black tracking-wider"
                >
                  <Play className="mr-3 h-6 w-6 fill-current" /> INICIAR MISIÓN
                </Button>
                <p className="text-sm text-slate-500 uppercase tracking-widest mt-4">
                  Múltiples sectores detectados en el radar
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
