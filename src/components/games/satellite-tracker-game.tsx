"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  WifiOff,
  Radar,
  RotateCcw,
  Play,
  Radio,
  Satellite,
} from "lucide-react";

interface SatelliteGameProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    distractorImages?: string[];
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
}

export default function SatelliteTrackerGame({ config }: SatelliteGameProps) {
  const duration = config.duration || 120;
  const difficulty = config.difficulty || "medium";

  // Configuración
  const settings = {
    easy: { speed: 4, drain: 0.5, eventChance: 0.005 }, // 4 segundos en moverse
    medium: { speed: 3, drain: 1, eventChance: 0.008 }, // 3 segundos
    hard: { speed: 2, drain: 2, eventChance: 0.01 }, // 2 segundos (rápido)
  }[difficulty];

  // Estados
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);

  // Mecánica de Señal
  const [signalQuality, setSignalQuality] = useState(50);
  const [isHovering, setIsHovering] = useState(false);

  // Evento Crítico
  const [isCriticalEvent, setIsCriticalEvent] = useState(false);

  // Posición del Satélite
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // Refs para el loop de juego (puntos y señal)
  const requestRef = useRef<number>(0);

  // --- 1. GAME LOOP (Solo maneja Puntos y Señal, NO movimiento) ---
  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return;

    // Lógica de Señal
    setSignalQuality((prev) => {
      if (isHovering) {
        // Si estás encima, sube la señal
        const boost = prev < 100 ? 0.5 : 0;
        if (prev >= 100) setScore((s) => s + 5); // Puntos extra por mantener al 100%
        return Math.min(prev + boost, 100);
      } else {
        // Si no, baja
        return Math.max(prev - settings.drain, 0);
      }
    });

    // Probabilidad de Evento Crítico
    if (!isCriticalEvent && Math.random() < settings.eventChance) {
      triggerCriticalEvent();
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, isHovering, isCriticalEvent, settings]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, gameLoop]);

  // --- 2. TEMPORIZADOR ---
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameState("finished");
    }
  }, [gameState, timeLeft]);

  // --- 3. MOVIMIENTO AUTÓNOMO (La solución real) ---
  const moveToNewPosition = () => {
    // Solo se mueve si estamos jugando
    if (gameState !== "playing") return;

    const newX = Math.random() * 80 + 10; // 10% a 90%
    const newY = Math.random() * 80 + 10;
    setPosition({ x: newX, y: newY });
  };

  // --- FUNCIONES AUXILIARES ---
  const triggerCriticalEvent = () => {
    setIsCriticalEvent(true);
    setTimeout(() => setIsCriticalEvent(false), 2000);
  };

  const handleCriticalClick = () => {
    if (isCriticalEvent) {
      setScore((prev) => prev + 1000);
      setSignalQuality(100);
      setIsCriticalEvent(false);
    }
  };

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setSignalQuality(50);
    setTimeLeft(duration);
    setIsCriticalEvent(false);

    // Forzamos el primer movimiento
    setTimeout(() => {
      setPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
    }, 100);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD SUPERIOR */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <div
            className={`p-2 rounded-full transition-colors ${signalQuality > 30 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-500 animate-pulse"}`}
          >
            {signalQuality > 30 ? (
              <Wifi className="w-6 h-6" />
            ) : (
              <WifiOff className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Enlace Satelital
            </p>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className={`h-full transition-all duration-100 ${
                  signalQuality > 80
                    ? "bg-green-500 shadow-[0_0_10px_#22c55e]"
                    : signalQuality > 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${signalQuality}%` }}
              />
            </div>
          </div>
        </div>
        <div className="text-3xl font-mono font-bold text-slate-200">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <div className="text-right w-1/3">
          <p className="text-xs text-slate-400 uppercase">Datos</p>
          <p className="text-2xl font-mono text-cyan-400">{score} MB</p>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="relative h-[500px] w-full bg-black overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl cursor-crosshair">
        {/* Fondo Decorativo */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        {/* PANTALLAS DE INICIO / FIN */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center">
            {gameState === "finished" ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-green-400">
                  ¡Rastreo Completado!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600">
                  <p className="text-slate-400 mb-2">
                    Datos totales transferidos
                  </p>
                  <p className="text-5xl font-mono text-cyan-300">{score} MB</p>
                </div>
                <Button
                  onClick={startGame}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Iniciar Nuevo Rastreo
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <Radar className="w-12 h-12 text-cyan-400 animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "Centinela Satélite"}
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {config.instruction ||
                    "Mantén el cursor sobre el satélite para no perder la señal."}
                </p>
                <Button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg shadow-green-900/20 transform hover:scale-105 transition-all"
                >
                  <Play className="mr-2 h-5 w-5" /> CONECTAR RADAR
                </Button>
              </div>
            )}
          </div>
        )}

        {/* --- SATÉLITE (OBJETO PRINCIPAL) --- */}
        <motion.div
          className="absolute z-30"
          // Framer Motion anima automáticamente a estas coordenadas
          animate={{
            top: `${position.y}%`,
            left: `${position.x}%`,
          }}
          transition={{
            duration: settings.speed,
            ease: "easeInOut",
          }}
          // ESTA ES LA CLAVE: Cuando termina de moverse, pide otro destino automáticamente
          onAnimationComplete={moveToNewPosition}
          // Eventos del Mouse
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onPointerDown={handleCriticalClick}
        >
          <div
            className={`
            relative w-32 h-32 flex items-center justify-center transition-all duration-200
            ${isCriticalEvent ? "scale-110 cursor-pointer" : "scale-100"}
          `}
          >
            {/* Indicadores Visuales */}
            {isHovering && !isCriticalEvent && (
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            )}
            {isCriticalEvent && (
              <div className="absolute inset-0 bg-red-500/40 rounded-full animate-ping duration-100" />
            )}

            {/* Cuerpo del Satélite */}
            <div
              className={`
               w-20 h-20 rounded-full flex items-center justify-center shadow-2xl relative z-10 overflow-hidden bg-slate-900
               ${isCriticalEvent ? "border-4 border-red-500 shadow-red-500/50" : "border-2 border-slate-500"}
               ${isHovering ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]" : ""}
             `}
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
                  className={`w-10 h-10 ${isCriticalEvent ? "text-red-400 animate-pulse" : "text-cyan-200"}`}
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
      </div>
    </div>
  );
}
