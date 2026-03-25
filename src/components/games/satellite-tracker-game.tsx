// src/components/games/satellite-tracker-game.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  WifiOff,
  Radar,
  RotateCcw,
  Play,
  Satellite,
  Volume2,
  VolumeX,
} from "lucide-react";
import useSound from "use-sound";
import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import { useSatelliteEngine } from "@/hooks/useSatelliteEngine";

interface SatelliteGameProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    distractorImages?: string[];
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
  };
}

export default function SatelliteTrackerGame({ config }: SatelliteGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Sonidos (Estandarizados al formato del proyecto)
  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-space.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playCriticalAlert] = useSound("/sounds/error-buzz.mp3", {
    volume: 0.3,
  });
  const [playCriticalCatch] = useSound("/sounds/combo-powerup.mp3", {
    volume: 0.6,
  });

  const engine = useSatelliteEngine({
    duration: config.duration || 120,
    difficulty: config.difficulty || "medium",
    onCriticalEventTrigger: () => {
      if (soundEnabled) playCriticalAlert();
    },
    onCriticalEventCatch: () => {
      if (soundEnabled) playCriticalCatch();
    },
    onFinish: async (finalScore, telemetry) => {
      stopBg();
      if (config.isPractice) return;

      // Bloqueamos la UI inmediatamente
      setIsSaving(true);

      console.log("Telemetría Radar Satelital:", telemetry);

      // Enviamos a la BD
      await saveMissionProgress(
        config.kidId,
        config.missionId,
        config.energyReward,
        telemetry,
      );

      // Redirigimos sin quitar el isSaving para evitar destellos
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

          <div className="flex-1 w-full flex items-center gap-2">
            <div
              className={`p-2 rounded-full transition-colors ${engine.signalQuality > 30 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-500 animate-pulse"}`}
            >
              {engine.signalQuality > 30 ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                Enlace
              </p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                <div
                  className={`h-full transition-all duration-100 ${engine.signalQuality > 80 ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : engine.signalQuality > 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${engine.signalQuality}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          {Math.floor(engine.timeLeft / 60)}:
          {(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3">
          <p className="text-xs text-slate-400 uppercase">Datos</p>
          <p className="text-2xl font-mono text-cyan-400">{engine.score} MB</p>
        </div>
      </div>

      {/* VIEWPORT */}
      <div
        className="relative h-125 w-full bg-black overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl cursor-crosshair"
        onPointerDown={engine.handleFalsePositive}
      >
        {/* Fondo Decorativo SIEMPRE visible de fondo */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* 🔥 LA LÓGICA DE RENDERIZADO EXCLUSIVO (Candado Visual)
            1. Si está guardando, bloquea TODO.
            2. Si no está guardando, y no está jugando, muestra menú.
            3. Si está jugando, dibuja el satélite.
        */}
        {isSaving ? (
          <div className="absolute inset-0 z-100 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <Radar className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
            <p className="text-cyan-400 font-bold text-3xl animate-pulse tracking-widest">
              Transfiriendo Datos al HQ...
            </p>
            <p className="text-slate-400 mt-4 text-sm font-mono uppercase">
              Por favor espere. Sincronizando Bitácora Clínica.
            </p>
          </div>
        ) : engine.gameState !== "playing" ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center animate-in fade-in duration-300">
            {engine.gameState === "finished" ? (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-green-400">
                  ¡Rastreo Completado!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600">
                  <p className="text-slate-400 mb-2">
                    Datos totales transferidos
                  </p>
                  <p className="text-5xl font-mono text-cyan-300">
                    {engine.score} MB
                  </p>
                </div>
                {/* Ocultamos el botón si el isSaving va a entrar (aunque la lógica de arriba ya lo previene, es una doble capa de seguridad) */}
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl disabled:opacity-50"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Iniciar Nuevo Rastreo
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <Radar className="w-12 h-12 text-cyan-400 animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "Centinela Satélite"}
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {config.instruction ||
                    "Mantén el cursor sobre el satélite para no perder la señal. ¡Haz clic rápido si se pone rojo!"}
                </p>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg shadow-green-900/20 transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Play className="mr-2 h-5 w-5" /> CONECTAR RADAR
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* --- SATÉLITE (OBJETO PRINCIPAL) --- */}
            <motion.div
              className="absolute z-30"
              animate={{
                top: `${engine.position.y}%`,
                left: `${engine.position.x}%`,
              }}
              transition={{
                duration: engine.settings.speed,
                ease: "easeInOut",
              }}
              onAnimationComplete={engine.moveToNewPosition}
              onMouseEnter={() => engine.setHovering(true)}
              onMouseLeave={() => engine.setHovering(false)}
              onPointerDown={(e) => engine.handleCriticalClick(e)}
            >
              <div
                className={`relative w-32 h-32 flex items-center justify-center transition-all duration-200 ${engine.isCriticalEvent ? "scale-110 cursor-pointer" : "scale-100"}`}
              >
                {engine.isHovering && !engine.isCriticalEvent && (
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                )}
                {engine.isCriticalEvent && (
                  <div className="absolute inset-0 bg-red-500/40 rounded-full animate-ping duration-100" />
                )}

                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl relative z-10 overflow-hidden bg-slate-900 ${engine.isCriticalEvent ? "border-4 border-red-500 shadow-red-500/50" : "border-2 border-slate-500"} ${engine.isHovering ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]" : ""}`}
                >
                  {config.targetImage ? (
                    <img
                      src={config.targetImage}
                      alt="Satélite"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <Satellite
                      className={`w-10 h-10 ${engine.isCriticalEvent ? "text-red-400 animate-pulse" : "text-cyan-200"}`}
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Nubes / Distractores */}
            {config.distractorImages?.map((img, index) => (
              <motion.div
                key={`cloud-${index}`}
                className="absolute z-40 pointer-events-none"
                initial={{ left: "-20%", top: `${Math.random() * 80}%` }}
                animate={{ left: "120%" }}
                transition={{
                  duration: 20 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 2,
                }}
              >
                <img
                  src={img}
                  alt="Nube"
                  className="w-48 h-48 object-contain opacity-50 blur-sm"
                />
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
