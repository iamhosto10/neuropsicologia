"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Star,
  Zap,
  RotateCcw,
  Play,
  AlertTriangle,
} from "lucide-react";

type GameObject = {
  id: number;
  x: number;
  type: "target" | "distractor";
  rotation: number;
  speed: number;
  imageUrl?: string;
};

interface SpaceCleanupProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    distractorImages?: string[];
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
}

export default function SpaceCleanupGame({ config }: SpaceCleanupProps) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  // Estados del juego
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);

  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [items, setItems] = useState<GameObject[]>([]);
  const [timeLeft, setTimeLeft] = useState(duration);

  const settings = {
    easy: { spawnRate: 1500, speed: 8, damage: 20 },
    medium: { spawnRate: 1000, speed: 6, damage: 25 },
    hard: { spawnRate: 600, speed: 3, damage: 34 },
  }[difficulty];

  // --- 1. Función de Finalización ---
  const finishGame = useCallback((result: "win" | "lose") => {
    setGameState("finished");
    setGameResult(result);
    setItems([]);
  }, []);

  // --- 2. Control del Tiempo ---
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame("win");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [gameState, timeLeft, finishGame]);

  // --- 3. Lógica de Spawning (Generación de Objetos) ---
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnInterval = setInterval(() => {
      const isTarget = Math.random() > 0.6;

      // CAMBIO: Lógica de selección de imagen
      let selectedImage: string | undefined = undefined;

      if (isTarget) {
        // Si hay imagen de objetivo en config, úsala
        selectedImage = config.targetImage;
      } else {
        // Si hay distractores en config, elige uno al azar
        if (config.distractorImages && config.distractorImages.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * config.distractorImages.length,
          );
          selectedImage = config.distractorImages[randomIndex];
        }
      }

      const newItem: GameObject = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        type: isTarget ? "target" : "distractor",
        rotation: Math.random() * 360,
        speed: settings.speed + Math.random() * 2,
        imageUrl: selectedImage, // Asignamos la imagen seleccionada
      };

      setItems((prev) => [...prev, newItem]);
    }, settings.spawnRate);

    return () => clearInterval(spawnInterval);
  }, [gameState, settings, config]); // Agregamos config a dependencias

  // --- 4. Interacción ---
  const handleInteraction = (item: GameObject) => {
    if (gameState !== "playing") return;

    if (item.type === "target") {
      setScore((prev) => prev + 100);
      setEnergy((prev) => Math.min(prev + 5, 100));
    } else {
      triggerGlitchEffect();
      setEnergy((prev) => {
        const newEnergy = Math.max(prev - settings.damage, 0);
        if (newEnergy === 0) {
          finishGame("lose");
        }
        return newEnergy;
      });
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const triggerGlitchEffect = () => {
    const container = document.getElementById("game-viewport");
    if (container) {
      container.classList.add("bg-red-900/50", "animate-shake");
      setTimeout(
        () => container.classList.remove("bg-red-900/50", "animate-shake"),
        200,
      );
    }
  };

  const startGame = () => {
    setGameState("playing");
    setGameResult(null);
    setScore(0);
    setEnergy(100);
    setTimeLeft(duration);
    setItems([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none">
      {/* HUD SUPERIOR */}
      <div
        className={`flex justify-between items-center bg-slate-900 text-cyan-400 p-4 rounded-t-xl border-b-4 transition-colors duration-300 shadow-lg ${energy < 30 ? "border-red-600 animate-pulse" : "border-cyan-600"}`}
      >
        <div className="flex items-center gap-2">
          <Zap
            className={`w-5 h-5 ${energy < 30 ? "text-red-500 fill-red-500" : "text-yellow-400 fill-yellow-400"}`}
          />
          <div className="w-24 md:w-32 h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <div
              className={`h-full transition-all duration-300 ${energy < 30 ? "bg-red-500" : "bg-yellow-400"}`}
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
        <div className="text-3xl font-bold font-mono text-white">
          {timeLeft}s
        </div>
        <div className="text-xl font-mono text-white">PTS: {score}</div>
      </div>

      {/* VIEWPORT */}
      <div
        id="game-viewport"
        className="relative h-[500px] w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #1e293b 0%, #020617 100%)",
        }}
      >
        {/* OVERLAYS DE ESTADO (Inicio / Fin) */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm text-white p-8 text-center animate-in fade-in duration-300">
            {gameState === "finished" ? (
              <div className="space-y-6">
                {gameResult === "win" ? (
                  <>
                    <h2 className="text-4xl font-bold text-yellow-400 animate-bounce">
                      ¡Misión Cumplida!
                    </h2>
                    <p className="text-xl text-slate-300">
                      Has recolectado suficiente energía.
                    </p>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-yellow-500/30">
                      <p className="text-slate-400 uppercase text-sm tracking-wider mb-2">
                        Puntaje Final
                      </p>
                      <p className="text-5xl font-mono font-bold text-cyan-300">
                        {score}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-4xl font-bold text-red-500">
                      Misión Abortada
                    </h2>
                    <p className="text-xl text-slate-300 max-w-md">
                      La nave se quedó sin energía. Ten cuidado con la basura
                      espacial.
                    </p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-red-900/50">
                      <p className="text-slate-400 text-sm">
                        Puntaje alcanzado: {score}
                      </p>
                    </div>
                  </>
                )}

                <Button
                  onClick={startGame}
                  size="lg"
                  className={`text-lg px-8 py-6 rounded-xl shadow-lg group transition-all ${gameResult === "win" ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20" : "bg-red-600 hover:bg-red-500 shadow-red-900/20"}`}
                >
                  <RotateCcw className="mr-2 h-5 w-5 group-hover:-rotate-180 transition-transform" />
                  Intentar de Nuevo
                </Button>
              </div>
            ) : (
              // PANTALLA DE INICIO
              <div className="space-y-6 max-w-lg">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                  {/* CAMBIO: Mostrar la imagen objetivo en la pantalla de inicio si existe */}
                  {config.targetImage ? (
                    <img
                      src={config.targetImage}
                      alt="Objetivo"
                      className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    />
                  ) : (
                    <Star className="w-10 h-10 text-cyan-400 fill-cyan-400/20" />
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "Operación Limpieza"}
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  {config.instruction ||
                    "Haz clic solo en los objetivos azules."}
                </p>
                <div className="flex gap-4 justify-center text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    {config.targetImage ? (
                      <img
                        src={config.targetImage}
                        alt="Objetivo"
                        className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                      />
                    ) : (
                      <Star className="w-10 h-10 text-cyan-400 fill-cyan-400/20" />
                    )}
                    +Puntos
                  </div>
                  <div className="flex items-center gap-2">
                    {config.distractorImages ? (
                      config.distractorImages.map((img) => (
                        <img
                          src={img}
                          alt="Objetivo"
                          className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                        />
                      ))
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-400" />
                    )}
                    -Energía
                  </div>
                </div>
                <Button
                  onClick={startGame}
                  size="lg"
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg shadow-green-900/20 animate-pulse"
                >
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  INICIAR MISIÓN
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ELEMENTOS DEL JUEGO */}
        <AnimatePresence>
          {items.map((item) => (
            <motion.button
              key={item.id}
              initial={{ top: -80, left: `${item.x}%`, rotate: item.rotation }}
              animate={{ top: "120%", rotate: item.rotation + 180 }}
              transition={{ duration: item.speed, ease: "linear" }}
              onAnimationComplete={() =>
                setItems((prev) => prev.filter((i) => i.id !== item.id))
              }
              onPointerDown={() => handleInteraction(item)}
              className="absolute w-20 h-20 flex items-center justify-center focus:outline-none touch-none select-none z-10"
            >
              <div
                className={`
                w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform overflow-hidden
                ${
                  item.type === "target"
                    ? "bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    : "bg-red-500/20 border-2 border-red-500/50"
                }
              `}
              >
                {/* CAMBIO: Renderizado condicional Imagen vs Icono */}
                {item.imageUrl ? (
                  // Si tenemos imagen de Sanity, la usamos
                  <img
                    src={item.imageUrl}
                    alt={item.type}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : // Fallback a iconos si no hay imagen
                item.type === "target" ? (
                  <Star className="w-8 h-8 text-cyan-200 fill-cyan-400" />
                ) : (
                  <Trash2 className="w-8 h-8 text-red-400" />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>
    </div>
  );
}
