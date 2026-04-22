// src/hooks/useNavigationEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState =
  | "start"
  | "playing"
  | "executing"
  | "level-passed"
  | "finished";
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Position = { x: number; y: number };

export type NavigationTelemetryConsolidated = {
  finalScore: number;
  levelsCompleted: number;
  totalCrashes: number;
  totalCorrections: number;
  avgPlanningTimeMs: number;
  efficiencyScore: number;
};

interface EngineConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  onLevelComplete?: (combo: number) => void;
  onCrash?: () => void;
  onFinish?: (
    score: number,
    telemetry: NavigationTelemetryConsolidated[],
  ) => void;
}

// // 🔥 BANCO DE MUNDOS (Progresión continua)
// const LEVEL_BANK = [
//   {
//     size: 4,
//     start: { x: 0, y: 3 },
//     end: { x: 3, y: 0 },
//     obstacles: [
//       { x: 1, y: 2 },
//       { x: 2, y: 1 },
//     ],
//   }, // 0: Muy fácil
//   {
//     size: 4,
//     start: { x: 0, y: 0 },
//     end: { x: 3, y: 3 },
//     obstacles: [
//       { x: 1, y: 0 },
//       { x: 1, y: 2 },
//       { x: 2, y: 3 },
//     ],
//   }, // 1: Fácil
//   {
//     size: 5,
//     start: { x: 0, y: 4 },
//     end: { x: 4, y: 0 },
//     obstacles: [
//       { x: 1, y: 3 },
//       { x: 2, y: 2 },
//       { x: 3, y: 1 },
//       { x: 4, y: 2 },
//     ],
//   }, // 2: Medio diagonal
//   {
//     size: 5,
//     start: { x: 0, y: 0 },
//     end: { x: 4, y: 4 },
//     obstacles: [
//       { x: 1, y: 1 },
//       { x: 2, y: 1 },
//       { x: 1, y: 3 },
//       { x: 3, y: 3 },
//       { x: 4, y: 2 },
//       { x: 2, y: 4 },
//     ],
//   }, // 3: Medio laberinto
//   {
//     size: 6,
//     start: { x: 0, y: 5 },
//     end: { x: 5, y: 0 },
//     obstacles: [
//       { x: 0, y: 3 },
//       { x: 1, y: 3 },
//       { x: 2, y: 3 },
//       { x: 4, y: 2 },
//       { x: 4, y: 1 },
//       { x: 2, y: 5 },
//     ],
//   }, // 4: Difícil muro
//   {
//     size: 6,
//     start: { x: 0, y: 0 },
//     end: { x: 5, y: 5 },
//     obstacles: [
//       { x: 1, y: 0 },
//       { x: 1, y: 1 },
//       { x: 1, y: 2 },
//       { x: 3, y: 5 },
//       { x: 3, y: 4 },
//       { x: 3, y: 3 },
//       { x: 5, y: 1 },
//     ],
//   }, // 5: Difícil zig zag
// ];

// 🔥 BANCO DE MUNDOS (Progresión continua)
const LEVEL_BANK = [
  {
    size: 4,
    start: { x: 0, y: 3 },
    end: { x: 3, y: 0 },
    obstacles: [
      { x: 1, y: 2 },
      { x: 2, y: 1 },
    ],
  }, // 0: Muy fácil
  {
    size: 4,
    start: { x: 0, y: 0 },
    end: { x: 3, y: 3 },
    obstacles: [
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 3 },
    ],
  }, // 1: Fácil
  {
    size: 5,
    start: { x: 0, y: 4 },
    end: { x: 4, y: 0 },
    obstacles: [
      { x: 1, y: 3 },
      { x: 2, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 2 },
    ],
  }, // 2: Medio diagonal
  {
    size: 5,
    start: { x: 0, y: 0 },
    end: { x: 4, y: 4 },
    obstacles: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 3 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 2, y: 4 },
    ],
  }, // 3: Medio laberinto
  {
    size: 6,
    start: { x: 0, y: 5 },
    end: { x: 5, y: 0 },
    obstacles: [
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 4, y: 2 },
      { x: 4, y: 1 },
      { x: 2, y: 5 },
    ],
  }, // 4: Difícil muro
  {
    size: 6,
    start: { x: 0, y: 0 },
    end: { x: 5, y: 5 },
    obstacles: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 5 },
      { x: 3, y: 4 },
      { x: 3, y: 3 },
      { x: 5, y: 1 },
    ],
  }, // 5: Difícil zig zag
  {
    size: 7,
    start: { x: 0, y: 6 },
    end: { x: 6, y: 0 },
    obstacles: [
      { x: 0, y: 3 },
      { x: 1, y: 3 }, // Muro horizontal izquierdo
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 3, y: 6 }, // Muro central (hueco en y=2)
      { x: 4, y: 1 },
      { x: 5, y: 1 }, // Muro horizontal derecho
    ],
  }, // 6: Experto Var 1 - El Laberinto en Z
  {
    size: 7,
    start: { x: 0, y: 0 },
    end: { x: 6, y: 6 },
    obstacles: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 }, // Muro superior
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 4 }, // Muro inferior
    ],
  }, // 7: Experto Var 2 - La Serpiente S
  {
    size: 7,
    start: { x: 0, y: 6 },
    end: { x: 6, y: 0 },
    obstacles: [
      { x: 1, y: 1 },
      { x: 1, y: 3 },
      { x: 1, y: 5 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 5 },
      { x: 5, y: 1 },
      { x: 5, y: 3 },
      { x: 5, y: 5 },
      { x: 2, y: 4 },
      { x: 4, y: 2 }, // Trampas adicionales
    ],
  }, // 8: Experto Var 3 - Campo de Pilares
  {
    size: 7,
    start: { x: 3, y: 6 },
    end: { x: 3, y: 0 },
    obstacles: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 }, // Techo central
      { x: 2, y: 3 },
      { x: 4, y: 3 }, // Paredes centrales
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 }, // Suelo central
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 }, // Brazos laterales
    ],
  }, // 9: Experto Var 4 - Cruce Peligroso
  {
    size: 7,
    start: { x: 0, y: 6 },
    end: { x: 6, y: 0 },
    obstacles: [
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 1 },
      { x: 6, y: 1 },
    ],
  }, // 6: Experto - Laberinto en Z (Size 7x7)
];

export function useNavigationEngine({
  duration = 120,
  difficulty = "medium",
  onLevelComplete,
  onCrash,
  onFinish,
}: EngineConfig) {
  const [gameState, setGameState] = useState<GameState>("start");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // 🔥 PROGRESIÓN DE NIVELES
  const startIndex =
    difficulty === "hard" ? 4 : difficulty === "medium" ? 2 : 0;
  const [levelIndex, setLevelIndex] = useState(startIndex);
  const [levelConfig, setLevelConfig] = useState(LEVEL_BANK[startIndex]);
  const [roverPos, setRoverPos] = useState<Position>(
    LEVEL_BANK[startIndex].start,
  );

  const [commands, setCommands] = useState<Direction[]>([]);

  // Referencias para Telemetría
  const levelStartTimeRef = useRef<number>(0);
  const firstMoveTimeRef = useRef<number | null>(null);
  const metricsRef = useRef({
    levelsCompleted: 0,
    totalCrashes: 0,
    totalCorrections: 0,
    planningTimes: [] as number[],
    totalOptimumMoves: 0,
    totalActualMoves: 0,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const addCommand = useCallback(
    (dir: Direction) => {
      if (gameState !== "playing") return;
      if (commands.length === 0) {
        firstMoveTimeRef.current = Date.now();
        metricsRef.current.planningTimes.push(
          firstMoveTimeRef.current - levelStartTimeRef.current,
        );
      }
      setCommands((prev) => (prev.length < 60 ? [...prev, dir] : prev));
    },
    [gameState, commands.length],
  );

  const removeLastCommand = useCallback(() => {
    if (gameState !== "playing" || commands.length === 0) return;
    metricsRef.current.totalCorrections += 1;
    setCommands((prev) => prev.slice(0, -1));
  }, [gameState, commands.length]);

  const startGame = useCallback(() => {
    const initIdx = difficulty === "hard" ? 4 : difficulty === "medium" ? 2 : 0;
    setGameState("playing");
    setTimeLeft(duration);
    setScore(0);
    setCombo(0);
    setCommands([]);
    setLevelIndex(initIdx);
    setLevelConfig(LEVEL_BANK[initIdx]);
    setRoverPos(LEVEL_BANK[initIdx].start);

    metricsRef.current = {
      levelsCompleted: 0,
      totalCrashes: 0,
      totalCorrections: 0,
      planningTimes: [],
      totalOptimumMoves: 0,
      totalActualMoves: 0,
    };
    levelStartTimeRef.current = Date.now();
    firstMoveTimeRef.current = null;
  }, [duration, difficulty]);

  const finishGame = useCallback(() => {
    setGameState("finished");
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const metrics = metricsRef.current;
    const avgPlanning =
      metrics.planningTimes.length > 0
        ? metrics.planningTimes.reduce((a, b) => a + b, 0) /
          metrics.planningTimes.length
        : 0;
    const efficiency =
      metrics.totalActualMoves > 0
        ? Math.round(
            (metrics.totalOptimumMoves / metrics.totalActualMoves) * 100,
          )
        : 0;

    const consolidatedTelemetry: NavigationTelemetryConsolidated[] = [
      {
        finalScore: score,
        levelsCompleted: metrics.levelsCompleted,
        totalCrashes: metrics.totalCrashes,
        totalCorrections: metrics.totalCorrections,
        avgPlanningTimeMs: Math.round(avgPlanning),
        efficiencyScore: Math.min(efficiency, 100),
      },
    ];

    if (onFinish) onFinish(score, consolidatedTelemetry);
  }, [score, onFinish]);

  const executeSequence = useCallback(async () => {
    if (commands.length === 0 || gameState !== "playing") return;

    setGameState("executing");

    const optimumMoves =
      Math.abs(levelConfig.end.x - levelConfig.start.x) +
      Math.abs(levelConfig.end.y - levelConfig.start.y);
    metricsRef.current.totalOptimumMoves += optimumMoves;
    metricsRef.current.totalActualMoves += commands.length;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let currentPos = { ...levelConfig.start };

    for (let i = 0; i < commands.length; i++) {
      if (signal.aborted) return;

      const cmd = commands[i];
      let nextPos = { ...currentPos };

      if (cmd === "UP") nextPos.y -= 1;
      if (cmd === "DOWN") nextPos.y += 1;
      if (cmd === "LEFT") nextPos.x -= 1;
      if (cmd === "RIGHT") nextPos.x += 1;

      const isOutOfBounds =
        nextPos.x < 0 ||
        nextPos.x >= levelConfig.size ||
        nextPos.y < 0 ||
        nextPos.y >= levelConfig.size;
      const isCrash = levelConfig.obstacles.some(
        (obs) => obs.x === nextPos.x && obs.y === nextPos.y,
      );

      if (isOutOfBounds || isCrash) {
        metricsRef.current.totalCrashes += 1;
        setCombo(0);
        if (onCrash) onCrash();

        setRoverPos(isCrash ? nextPos : currentPos);
        await new Promise((r) => setTimeout(r, 800));

        setRoverPos(levelConfig.start);
        setCommands([]);
        setGameState("playing");
        levelStartTimeRef.current = Date.now();
        firstMoveTimeRef.current = null;
        return;
      }

      currentPos = nextPos;
      setRoverPos(currentPos);
      await new Promise((r) => setTimeout(r, 400));
    }

    if (
      currentPos.x === levelConfig.end.x &&
      currentPos.y === levelConfig.end.y
    ) {
      // 🔥 ¡PASÓ EL MUNDO!
      metricsRef.current.levelsCompleted += 1;
      setGameState("level-passed"); // Mostramos transición visual

      setCombo((c) => {
        const newCombo = c + 1;
        setScore((s) => s + 100 * newCombo);
        if (onLevelComplete) onLevelComplete(newCombo);
        return newCombo;
      });

      // Esperamos 1.5s para que vea su victoria y cargamos el siguiente mundo
      await new Promise((r) => setTimeout(r, 1500));

      if (signal.aborted) return;

      setLevelIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        const nextLevel = LEVEL_BANK[nextIdx % LEVEL_BANK.length]; // Hace bucle infinito si se acaban
        setLevelConfig(nextLevel);
        setRoverPos(nextLevel.start);
        return nextIdx;
      });

      setCommands([]);
      levelStartTimeRef.current = Date.now();
      firstMoveTimeRef.current = null;
      setGameState("playing");
    } else {
      setCombo(0);
      if (onCrash) onCrash();
      await new Promise((r) => setTimeout(r, 1000));
      setRoverPos(levelConfig.start);
      setCommands([]);
      setGameState("playing");
    }
  }, [commands, gameState, levelConfig, levelIndex, onCrash, onLevelComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      (gameState === "playing" ||
        gameState === "executing" ||
        gameState === "level-passed") &&
      timeLeft > 0
    ) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft, finishGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      if (e.key === "ArrowUp") addCommand("UP");
      if (e.key === "ArrowDown") addCommand("DOWN");
      if (e.key === "ArrowLeft") addCommand("LEFT");
      if (e.key === "ArrowRight") addCommand("RIGHT");
      if (e.key === "Backspace") removeLastCommand();
      if (e.key === "Enter") executeSequence();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, addCommand, removeLastCommand, executeSequence]);

  return {
    gameState,
    timeLeft,
    score,
    combo,
    levelIndex,
    levelConfig,
    roverPos,
    commands,
    startGame,
    addCommand,
    removeLastCommand,
    executeSequence,
  };
}
