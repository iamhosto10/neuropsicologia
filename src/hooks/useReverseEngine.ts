// src/hooks/useReverseEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type Direction = "up" | "down" | "left" | "right";
export type RuleType = "direct" | "reverse";
export type GameState = "start" | "playing" | "finished";

// Telemetría interna de cada turno
type TurnRecord = {
  rule: RuleType;
  success: boolean;
  reactionTimeMs: number;
  isTimeout: boolean;
};

// 🔥 NUEVO: Telemetría Consolidada para el Terapeuta
export type ReverseTelemetryConsolidated = {
  finalScore: number;
  maxCombo: number;
  totalAttempts: number;
  totalOmissions: number; // Veces que se quedó congelado (timeout)
  accuracyDirectPercent: number;
  accuracyReversePercent: number;
  avgReactionTimeDirectMs: number;
  avgReactionTimeReverseMs: number;
};

interface ReverseConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  onPlayVoice?: (dir: Direction) => void;
  onPlayCorrect?: () => void;
  onPlayError?: () => void;
  onTriggerShake?: () => void;
  onFinish?: (score: number, telemetry: ReverseTelemetryConsolidated[]) => void;
}

const opposites: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};
const directions: Direction[] = ["up", "down", "left", "right"];

export function useReverseEngine({
  duration = 60,
  difficulty = "medium",
  onPlayVoice,
  onPlayCorrect,
  onPlayError,
  onTriggerShake,
  onFinish,
}: ReverseConfig) {
  const settings = {
    easy: { timePerTurn: 10000 },
    medium: { timePerTurn: 8000 },
    hard: { timePerTurn: 4000 },
  }[difficulty];

  const [gameState, setGameState] = useState<GameState>("start");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const [currentDir, setCurrentDir] = useState<Direction | null>(null);
  const [currentRule, setCurrentRule] = useState<RuleType>("reverse");
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);
  const [turnProgress, setTurnProgress] = useState(100);

  // Refs de control
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const turnStartTime = useRef<number>(0);
  const timeLimit = useRef(settings.timePerTurn);

  // 🔥 Almacenamos el combo máximo alcanzado
  const maxComboRef = useRef(0);
  const telemetryRef = useRef<TurnRecord[]>([]);

  const clearTurnTimers = useCallback(() => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  const finishGame = useCallback(() => {
    clearTurnTimers();
    setGameState("finished");

    // 🔥 PROCESAMIENTO CLÍNICO: Consolidamos el arreglo gigante en un solo objeto resumen
    const records = telemetryRef.current;

    const directRecords = records.filter((r) => r.rule === "direct");
    const reverseRecords = records.filter((r) => r.rule === "reverse");

    const getAccuracy = (arr: TurnRecord[]) =>
      arr.length > 0
        ? Math.round((arr.filter((r) => r.success).length / arr.length) * 100)
        : 0;

    const getAvgReaction = (arr: TurnRecord[]) => {
      const hits = arr.filter((r) => r.success && !r.isTimeout); // Solo medimos tiempo de aciertos
      return hits.length > 0
        ? Math.round(
            hits.reduce((acc, curr) => acc + curr.reactionTimeMs, 0) /
              hits.length,
          )
        : 0;
    };

    const consolidatedTelemetry: ReverseTelemetryConsolidated[] = [
      {
        finalScore: score,
        maxCombo: maxComboRef.current,
        totalAttempts: records.length,
        totalOmissions: records.filter((r) => r.isTimeout).length,
        accuracyDirectPercent: getAccuracy(directRecords),
        accuracyReversePercent: getAccuracy(reverseRecords),
        avgReactionTimeDirectMs: getAvgReaction(directRecords),
        avgReactionTimeReverseMs: getAvgReaction(reverseRecords),
      },
    ];

    if (onFinish) onFinish(score, consolidatedTelemetry);
  }, [clearTurnTimers, score, onFinish]);

  const handleMiss = useCallback(() => {
    clearTurnTimers();
    setFeedback("miss");
    setCombo(0);
    if (onPlayError) onPlayError();

    // Guardar telemetría de fallo por tiempo (Omisión)
    telemetryRef.current.push({
      rule: currentRule,
      success: false,
      reactionTimeMs: settings.timePerTurn,
      isTimeout: true,
    });

    timeLimit.current = settings.timePerTurn;
    turnTimerRef.current = setTimeout(() => {
      setGameState((prev) => {
        if (prev === "playing") nextTurn();
        return prev;
      });
    }, 1200);
  }, [clearTurnTimers, onPlayError, settings.timePerTurn, currentRule]);

  const nextTurn = useCallback(() => {
    clearTurnTimers();
    setFeedback(null);
    setTurnProgress(100);

    const newDir = directions[Math.floor(Math.random() * directions.length)];
    const newRule = Math.random() > 0.5 ? "direct" : "reverse";

    setCurrentDir(newDir);
    setCurrentRule(newRule);

    if (onPlayVoice) onPlayVoice(newDir);
    turnStartTime.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - turnStartTime.current;
      const remaining = Math.max(0, 100 - (elapsed / timeLimit.current) * 100);
      setTurnProgress(remaining);

      if (remaining === 0) handleMiss();
    }, 50);
  }, [clearTurnTimers, handleMiss, onPlayVoice]);

  const handleInput = useCallback(
    (inputDir: Direction) => {
      if (gameState !== "playing" || feedback !== null || currentDir === null)
        return;

      clearTurnTimers();
      const expectedDir =
        currentRule === "direct" ? currentDir : opposites[currentDir];
      const reactionTime = Date.now() - turnStartTime.current;
      const isCorrect = inputDir === expectedDir;

      // Guardar telemetría de la acción
      telemetryRef.current.push({
        rule: currentRule,
        success: isCorrect,
        reactionTimeMs: reactionTime,
        isTimeout: false,
      });

      if (isCorrect) {
        const speedBonus = Math.max(
          0,
          Math.floor((timeLimit.current - reactionTime) / 10),
        );
        setCombo((prev) => {
          const newCombo = prev + 1;
          // Actualizamos el combo máximo
          if (newCombo > maxComboRef.current) maxComboRef.current = newCombo;
          setScore((s) => s + 100 + speedBonus + newCombo * 20);
          return newCombo;
        });
        setFeedback("hit");
        if (onPlayCorrect) onPlayCorrect();
        timeLimit.current = Math.max(800, timeLimit.current - 50); // Acelerar
      } else {
        setFeedback("miss");
        setCombo(0);
        timeLimit.current = settings.timePerTurn;
        if (onPlayError) onPlayError();
        if (onTriggerShake) onTriggerShake();
      }

      turnTimerRef.current = setTimeout(
        () => {
          setGameState((prev) => {
            if (prev === "playing") nextTurn();
            return prev;
          });
        },
        isCorrect ? 800 : 1200,
      );
    },
    [
      gameState,
      feedback,
      currentDir,
      currentRule,
      clearTurnTimers,
      onPlayCorrect,
      onPlayError,
      onTriggerShake,
      settings.timePerTurn,
      nextTurn,
    ],
  );

  const startGame = useCallback(() => {
    telemetryRef.current = [];
    maxComboRef.current = 0; // Reiniciamos el récord
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    timeLimit.current = settings.timePerTurn;
    setGameState("playing");
    setTimeout(nextTurn, 500);
  }, [duration, settings.timePerTurn, nextTurn]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
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
    return () => clearTurnTimers();
  }, [clearTurnTimers]);

  return {
    gameState,
    timeLeft,
    score,
    combo,
    currentDir,
    currentRule,
    feedback,
    turnProgress,
    startGame,
    handleInput,
  };
}
