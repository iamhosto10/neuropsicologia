import { useState, useEffect, useCallback, useRef } from "react";

export interface WarpDriveTelemetryConsolidated {
  totalEquations: number;
  correctAnswers: number;
  errorCount: number;
  maxStreak: number;
  avgReactionTimeMs: number;
  accuracyRate: number;
}

export function useWarpDriveEngine(config: {
  duration: number;
  difficulty: string;
}) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">(
    "idle",
  );
  const [timeLeft, setTimeLeft] = useState(config.duration);

  // Variables matemáticas
  const [currentBase, setCurrentBase] = useState(0);
  const [currentModifier, setCurrentModifier] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  // Telemetría en tiempo real (usamos useRef para no causar re-renders)
  const stats = useRef({
    totalEquations: 0,
    correctAnswers: 0,
    errorCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    reactionTimes: [] as number[],
    lastSpawnTime: 0,
  });

  const generateEquation = useCallback(
    (base?: number) => {
      let maxModifier = 3;
      if (config.difficulty === "medium") maxModifier = 5;
      if (config.difficulty === "hard") maxModifier = 9;

      const newBase =
        base !== undefined ? base : Math.floor(Math.random() * 5) + 1;
      const newModifier = Math.floor(Math.random() * maxModifier) + 1;
      const correctAns = newBase + newModifier;

      // Generar distractores inteligentes (cercanos a la respuesta real)
      const newOptions = new Set<number>([correctAns]);
      while (newOptions.size < 3) {
        const offset = Math.floor(Math.random() * 5) - 2; // -2 a +2
        const fakeAns = correctAns + offset;
        if (fakeAns > 0 && fakeAns !== correctAns) {
          newOptions.add(fakeAns);
        }
      }

      setCurrentBase(newBase);
      setCurrentModifier(newModifier);
      setOptions(Array.from(newOptions).sort(() => Math.random() - 0.5));

      stats.current.totalEquations++;
      stats.current.lastSpawnTime = Date.now();
    },
    [config.difficulty],
  );

  const startGame = useCallback(() => {
    setGameState("playing");
    setTimeLeft(config.duration);
    stats.current = {
      totalEquations: 0,
      correctAnswers: 0,
      errorCount: 0,
      currentStreak: 0,
      maxStreak: 0,
      reactionTimes: [],
      lastSpawnTime: 0,
    };
    generateEquation();
  }, [config.duration, generateEquation]);

  const handleAnswer = useCallback(
    (answer: number) => {
      if (gameState !== "playing") return;

      const isCorrect = answer === currentBase + currentModifier;

      if (isCorrect) {
        // Registrar telemetría de éxito
        stats.current.correctAnswers++;
        stats.current.currentStreak++;
        if (stats.current.currentStreak > stats.current.maxStreak) {
          stats.current.maxStreak = stats.current.currentStreak;
        }

        const reactionTime = Date.now() - stats.current.lastSpawnTime;
        stats.current.reactionTimes.push(reactionTime);

        // El resultado se convierte en la nueva base
        generateEquation(answer);
        return true;
      } else {
        // Telemetría de error
        stats.current.errorCount++;
        stats.current.currentStreak = 0;
        return false;
      }
    },
    [gameState, currentBase, currentModifier, generateEquation],
  );

  // Motor de tiempo
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Empaquetador final de telemetría
  const getTelemetry = (): WarpDriveTelemetryConsolidated => {
    const {
      totalEquations,
      correctAnswers,
      errorCount,
      maxStreak,
      reactionTimes,
    } = stats.current;
    const avgReactionTimeMs =
      reactionTimes.length > 0
        ? Math.round(
            reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length,
          )
        : 0;

    const accuracyRate =
      totalEquations > 0
        ? Math.round((correctAnswers / totalEquations) * 100)
        : 0;

    return {
      totalEquations,
      correctAnswers,
      errorCount,
      maxStreak,
      avgReactionTimeMs,
      accuracyRate,
    };
  };

  return {
    gameState,
    timeLeft,
    currentBase,
    currentModifier,
    options,
    startGame,
    handleAnswer,
    getTelemetry,
    currentScore: stats.current.correctAnswers,
  };
}
