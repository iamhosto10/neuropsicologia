"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  ShieldAlert,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Battery,
  Package,
} from "lucide-react";
import useSound from "use-sound";

interface MultitaskGameProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
}

// --- FÍSICAS REVISADAS ---
type GameObject = {
  id: number;
  type: "number" | "wall";
  x: number;
  y: number;
  value?: number;
  width: number;
  height: number;
  counted?: boolean;
  visible: boolean; // NUEVO: Para evitar el pantalleo al desaparecer
};

// Hitbox más pequeña (más justa para el jugador)
const PLAYER_WIDTH = 8;
const PLAYER_HEIGHT = 8;
const PLAYER_Y = 82;

export default function MultitaskEvasionGame({ config }: MultitaskGameProps) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  // --- VELOCIDADES REDUCIDAS (Ajuste Clínico) ---
  const settings = {
    // Fácil: Muy lento, 1 objeto cada 2.5 segundos. Cruza la pantalla en ~5 segundos.
    easy: { baseSpeed: 0.3, spawnRate: 2500, maxSpeed: 0.5 },
    // Medio: Ritmo moderado.
    medium: { baseSpeed: 0.5, spawnRate: 1500, maxSpeed: 0.8 },
    // Difícil: Rápido y desafiante.
    hard: { baseSpeed: 0.8, spawnRate: 1000, maxSpeed: 1.2 },
  }[difficulty];

  // --- AUDIO ---
  const [playBg, { stop: stopBg }] = useSound("/sounds/bg-warp.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playGood] = useSound("/sounds/collect-good.mp3", { volume: 0.7 });
  const [playBad] = useSound("/sounds/collect-bad.mp3", { volume: 0.7 });
  const [playCrash] = useSound("/sounds/wall-crash.mp3", { volume: 0.6 });

  // --- ESTADOS DE UI ---
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [cargo, setCargo] = useState(0);
  const [targetRule, setTargetRule] = useState<"even" | "odd">("even");

  const [renderShipX, setRenderShipX] = useState(46); // Centrado ajustado
  const [objects, setObjects] = useState<GameObject[]>([]);

  // --- REFS DEL MOTOR ---
  const shipXRef = useRef(46);
  const speedRef = useRef(settings.baseSpeed);
  const gameActiveRef = useRef(false);
  const requestRef = useRef<number>(0);
  const objectsRef = useRef<GameObject[]>([]);

  const healthRef = useRef(100);
  const scoreRef = useRef(0);
  const cargoRef = useRef(0);
  const soundEnabledRef = useRef(true);
  const targetRuleRef = useRef<"even" | "odd">("even");
  const settingsRef = useRef(settings);

  // --- 1. LÓGICA DE SPAWN ---
  const spawnObject = useCallback(() => {
    if (!gameActiveRef.current) return;

    const isNumber = Math.random() < 0.7;
    let newWidth = isNumber ? 8 : 12; // Objetos un poco más pequeños
    let newHeight = isNumber ? 8 : 12;

    let newX = isNumber
      ? Math.random() * (100 - newWidth)
      : Math.random() > 0.5
        ? 0
        : 100 - newWidth;

    const newObj: GameObject = {
      id: Date.now() + Math.random(),
      type: isNumber ? "number" : "wall",
      x: newX,
      y: -20,
      value: isNumber ? Math.floor(Math.random() * 9) + 1 : undefined,
      width: newWidth,
      height: newHeight,
      counted: false,
      visible: true, // Nace visible
    };

    objectsRef.current.push(newObj);
  }, []);

  // --- 2. BUCLE PRINCIPAL (Engine) ---
  const gameLoop = useCallback(() => {
    if (!gameActiveRef.current) return;

    let currentHealth = healthRef.current;
    let currentScore = scoreRef.current;
    let currentCargo = cargoRef.current;

    // Mover objetos
    objectsRef.current.forEach((obj) => {
      obj.y += speedRef.current;
    });

    // Limpiar objetos que salieron (y=120) o que ya "desaparecieron" hace rato
    objectsRef.current = objectsRef.current.filter((obj) => obj.y < 120);

    // DETECCIÓN DE COLISIONES
    const playerBox = {
      x: shipXRef.current,
      y: PLAYER_Y,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
    };

    objectsRef.current.forEach((obj) => {
      if (obj.counted || !obj.visible) return; // Si ya chocó, ignorar

      const isColliding =
        obj.x < playerBox.x + playerBox.w &&
        obj.x + obj.width > playerBox.x &&
        obj.y < playerBox.y + playerBox.h &&
        obj.y + obj.height > playerBox.y;

      if (isColliding) {
        obj.counted = true;
        obj.visible = false; // CORRECCIÓN PANTALLEO: Lo ocultamos suavemente, no lo teletransportamos

        if (obj.type === "wall") {
          if (soundEnabledRef.current) playCrash();
          currentHealth = Math.max(0, currentHealth - 25);
          speedRef.current = Math.max(
            settingsRef.current.baseSpeed,
            speedRef.current - 0.5,
          );
          triggerShake();
        } else if (obj.type === "number") {
          const isEven = obj.value! % 2 === 0;
          const isCorrect =
            (targetRuleRef.current === "even" && isEven) ||
            (targetRuleRef.current === "odd" && !isEven);

          if (isCorrect) {
            if (soundEnabledRef.current) playGood();
            currentScore += 100;
            currentCargo += 1;
            speedRef.current = Math.min(
              settingsRef.current.maxSpeed,
              speedRef.current + 0.05,
            ); // Aceleración más gentil
          } else {
            if (soundEnabledRef.current) playBad();
            currentHealth = Math.max(0, currentHealth - 15);
            speedRef.current = Math.max(
              settingsRef.current.baseSpeed,
              speedRef.current - 0.2,
            );
            triggerShake();
          }
        }
      }
    });

    // Actualizar Refs
    healthRef.current = currentHealth;
    scoreRef.current = currentScore;
    cargoRef.current = currentCargo;

    // Sincronizar DOM
    setRenderShipX(shipXRef.current);
    setObjects([...objectsRef.current]);

    // Solo actualizamos estados UI si cambiaron (optimización de React)
    setHealth((prev) => (prev !== currentHealth ? currentHealth : prev));
    setScore((prev) => (prev !== currentScore ? currentScore : prev));
    setCargo((prev) => (prev !== currentCargo ? currentCargo : prev));

    if (currentHealth <= 0) {
      finishGame();
      return;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [playGood, playBad, playCrash]);

  // --- 3. CONTROLES MOUSE/TOUCH ---
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gameActiveRef.current) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;

    x = x - PLAYER_WIDTH / 2;
    x = Math.max(0, Math.min(x, 100 - PLAYER_WIDTH));

    shipXRef.current = x;
  };

  // --- 4. INICIO Y FIN ---
  const finishGame = useCallback(() => {
    gameActiveRef.current = false;
    stopBg();
    setGameState("finished");
  }, [stopBg]);

  const startGame = () => {
    if (soundEnabledRef.current) playBg();

    const rule = Math.random() > 0.5 ? "even" : "odd";
    setTargetRule(rule);
    targetRuleRef.current = rule;

    healthRef.current = 100;
    scoreRef.current = 0;
    cargoRef.current = 0;
    objectsRef.current = [];
    speedRef.current = settings.baseSpeed;
    shipXRef.current = 46;

    setScore(0);
    setHealth(100);
    setCargo(0);
    setTimeLeft(duration);

    gameActiveRef.current = true;
    setGameState("playing");
  };

  // --- 5. CRONÓMETROS ---
  useEffect(() => {
    let spawnInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;

    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
      spawnInterval = setInterval(spawnObject, settings.spawnRate);

      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
    };
  }, [gameState, gameLoop, spawnObject, settings.spawnRate, finishGame]);

  // --- EFECTOS EXTRAS ---
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

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newVal = !prev;
      soundEnabledRef.current = newVal;
      if (newVal && gameState === "playing") playBg();
      if (!newVal) stopBg();
      return newVal;
    });
  };

  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      stopBg();
    };
  }, [stopBg]);

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
              <span>{health}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 w-full">
              <div
                className={`h-full transition-all duration-300 ${health > 50 ? "bg-green-500" : health > 20 ? "bg-yellow-500" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`}
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200 text-center">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3 flex flex-col items-end">
          <div className="text-xs text-slate-400 uppercase flex items-center gap-1">
            <Package className="w-3 h-3" /> Carga:{" "}
            <span className="text-cyan-400 font-bold ml-1">{cargo}</span>
          </div>
          <div className="text-xl font-mono text-cyan-400 mt-1">
            {score} PTS
          </div>
        </div>
      </div>

      {/* REGLA COGNITIVA */}
      {gameState === "playing" && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 bg-black/80 border border-cyan-500/50 px-6 py-2 rounded-full backdrop-blur-sm pointer-events-none w-max shadow-xl">
          <p className="text-white font-bold tracking-widest uppercase text-sm sm:text-base">
            Atrapa SOLO{" "}
            <span
              className={
                targetRule === "even" ? "text-green-400" : "text-purple-400"
              }
            >
              {targetRule === "even"
                ? "PARES (2,4,6...)"
                : "IMPARES (1,3,5...)"}
            </span>
          </p>
        </div>
      )}

      {/* VIEWPORT (DOM ENGINE) */}
      <div
        id="warp-viewport"
        onPointerMove={handlePointerMove}
        className="relative h-150 w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl cursor-crosshair touch-none"
      >
        {/* Fondo Parallax SUAVIZADO */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(transparent 50%, rgba(6,182,212,0.1) 50%)",
            backgroundSize: "100% 40px",
          }}
        >
          {gameState === "playing" && (
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

        {gameState === "playing" ? (
          <>
            {/* OBJETOS FÍSICOS */}
            {objects.map((obj) => {
              // CORRECCIÓN PANTALLEO: Si no es visible, devolvemos null, no lo renderizamos.
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
                left: `${renderShipX}%`,
                top: `${PLAYER_Y}%`,
                width: `${PLAYER_WIDTH}%`,
                height: `${PLAYER_HEIGHT}%`,
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
        ) : (
          /* PANTALLAS ESTADO */
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center">
            {gameState === "finished" ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <h2
                  className={`text-4xl font-bold ${health <= 0 ? "text-red-500" : "text-cyan-400"}`}
                >
                  {health <= 0 ? "¡NAVE DESTRUIDA!" : "¡VIAJE COMPLETADO!"}
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600">
                  <p className="text-slate-400 mb-2">Puntaje Operativo</p>
                  <p className="text-5xl font-mono text-cyan-300">{score}</p>
                  <p className="text-sm text-slate-400 mt-4">
                    Carga recuperada: {cargo} paquetes correctos
                  </p>
                </div>
                <Button
                  onClick={startGame}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Nuevo Intento
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all"
                >
                  <Play className="mr-2 h-5 w-5" /> DESPEGAR
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Fondo suavizado para evitar strobing */}
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
    </div>
  );
}
