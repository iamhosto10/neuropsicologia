// src/hooks/useReverseEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type Direction = "up" | "down" | "left" | "right";
export type RuleType = "direct" | "reverse";
export type GameState = "start" | "playing" | "finished";

export type ReverseTelemetry = {
  rule: RuleType;
  success: boolean;
  reactionTimeMs: number;
  isTimeout: boolean;
};

interface ReverseConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  onPlayVoice?: (dir: Direction) => void;
  onPlayCorrect?: () => void;
  onPlayError?: () => void;
  onTriggerShake?: () => void;
  onFinish?: (score: number, telemetry: ReverseTelemetry[]) => void;
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
  const telemetryRef = useRef<ReverseTelemetry[]>([]);

  const clearTurnTimers = useCallback(() => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  const finishGame = useCallback(() => {
    clearTurnTimers();
    setGameState("finished");
    if (onFinish) onFinish(score, telemetryRef.current);
  }, [clearTurnTimers, score, onFinish]);

  const handleMiss = useCallback(() => {
    clearTurnTimers();
    setFeedback("miss");
    setCombo(0);
    if (onPlayError) onPlayError();

    // Guardar telemetría de fallo por tiempo
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
          setScore((s) => s + 100 + speedBonus + newCombo * 20);
          return newCombo;
        });
        setFeedback("hit");
        if (onPlayCorrect) onPlayCorrect();
        timeLimit.current = Math.max(800, timeLimit.current - 50); // Acelerar el juego
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
    ],
  );

  const startGame = useCallback(() => {
    telemetryRef.current = [];
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    timeLimit.current = settings.timePerTurn;
    setGameState("playing");
    setTimeout(nextTurn, 500); // Pequeño delay inicial
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
