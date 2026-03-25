// src/components/games/signal-decoder-game.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import {
  Binary,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  ServerCrash,
} from "lucide-react";
import useSound from "use-sound";
import { useSymbolDigitEngine } from "@/hooks/useSymbolDigitEngine";

interface SignalDecoderProps {
  config: {
    title?: string;
    duration?: number;
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
  };
}

export default function SignalDecoderGame({ config }: SignalDecoderProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-tech.mp3", {
    loop: true,
    volume: 0.15,
  });
  const [playGood] = useSound("/sounds/beep-press.mp3", { volume: 0.5 });
  const [playBad] = useSound("/sounds/error-buzz.mp3", { volume: 0.4 });

  const engine = useSymbolDigitEngine({
    duration: config.duration || 60,
    onPlayGood: () => {
      if (soundEnabled) playGood();
    },
    onPlayBad: () => {
      if (soundEnabled) playBad();
    },
    onFinish: async (finalScore, telemetry) => {
      stopBg();
      if (config.isPractice) return;

      setIsSaving(true);

      console.log("Telemetría SDMT (Velocidad Procesamiento):", telemetry);
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
    if (soundEnabled) playBg();
    engine.startGame();
  };

  // Soporte de Teclado Numérico (1 al 9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engine.gameState !== "playing") return;
      // Capturar teclas del 1 al 9 (arriba de las letras) y Numpad
      if (e.key >= "1" && e.key <= "9") {
        engine.handleInput(parseInt(e.key));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [engine]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (soundEnabled) stopBg();
              else if (engine.gameState === "playing") playBg();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          {engine.combo > 1 && (
            <div className="text-xs font-bold text-yellow-400 uppercase hidden sm:block bg-yellow-900/30 px-2 py-1 rounded">
              Combo x{engine.combo}
            </div>
          )}
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          00:{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3 text-2xl font-mono text-cyan-400 font-bold">
          {engine.score} PTS
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="relative h-137.5 sm:h-150 w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col">
        {/* Fondo Decorativo */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {isSaving ? (
          <div className="absolute inset-0 z-100 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <ServerCrash className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-cyan-400 font-bold text-3xl animate-pulse tracking-widest text-center">
              Sincronizando Bitácora...
            </p>
          </div>
        ) : engine.gameState !== "playing" ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-8 text-center text-white">
            {engine.gameState === "finished" ? (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-cyan-400">
                  ¡Decodificación Finalizada!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                  <p className="text-slate-400 mb-2">Puntaje Final</p>
                  <p className="text-5xl font-mono text-cyan-300">
                    {engine.score}
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                  <Binary className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold">Decodificador de Señales</h2>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-left space-y-4">
                  <p className="text-slate-300">
                    Arriba verás la <strong>CLAVE</strong>. Abajo aparecerá un
                    símbolo.
                  </p>
                  <p className="text-cyan-400 font-bold text-center text-lg">
                    Encuentra el número que corresponde a ese símbolo y
                    presiónalo rápido.
                  </p>
                  <p className="text-slate-500 text-xs text-center uppercase tracking-widest mt-4">
                    Mide tu velocidad de procesamiento
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 w-full rounded-xl"
                >
                  <Play className="mr-2" /> INICIAR DECODIFICADOR
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full w-full z-10">
            {/* LEYENDA (La Clave SDMT) */}
            <div className="w-full bg-slate-900/80 border-b border-slate-700 p-2 sm:p-4 grid grid-cols-9 gap-1 sm:gap-2 shrink-0">
              {engine.legend.map((item) => (
                <div
                  key={item.digit}
                  className="flex flex-col items-center justify-center bg-slate-800 rounded-lg border border-slate-600 p-1 sm:p-2"
                >
                  <span className="text-xl sm:text-3xl mb-1 sm:mb-2">
                    {item.symbol}
                  </span>
                  <span className="font-bold font-mono text-cyan-400 text-sm sm:text-lg border-t border-slate-600 w-full text-center pt-1">
                    {item.digit}
                  </span>
                </div>
              ))}
            </div>

            {/* ZONA DE DECODIFICACIÓN Y TECLADO */}
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 p-4">
              {/* Símbolo Actual */}
              <div className="w-32 h-32 sm:w-48 sm:h-48 bg-slate-800/80 border-4 border-slate-600 rounded-3xl flex items-center justify-center shadow-2xl relative">
                <AnimatePresence mode="wait">
                  {engine.currentSymbol && (
                    <motion.div
                      key={engine.currentSymbol}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="text-7xl sm:text-9xl"
                    >
                      {engine.currentSymbol}
                    </motion.div>
                  )}
                </AnimatePresence>
                {engine.feedback === "miss" && (
                  <div className="absolute inset-0 border-4 border-red-500 rounded-3xl animate-pulse pointer-events-none" />
                )}
                {engine.feedback === "hit" && (
                  <div className="absolute inset-0 border-4 border-green-500 rounded-3xl animate-pulse pointer-events-none" />
                )}
              </div>

              {/* Teclado Numérico */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-70">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => engine.handleInput(num)}
                    className="h-16 sm:h-20 text-2xl sm:text-3xl font-black bg-slate-800 hover:bg-cyan-900 border-b-8 border-slate-700 hover:border-cyan-600 text-slate-300 hover:text-cyan-300 rounded-2xl transition-all active:translate-y-2 active:border-b-0 font-mono"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-center pb-4 text-slate-500 font-bold uppercase tracking-widest text-sm hidden sm:block">
              USA EL TECLADO NUMÉRICO DE TU PC PARA SER MÁS RÁPIDO
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
