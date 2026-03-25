// src/hooks/useFlankerEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";
export type Direction = "left" | "right";
export type TrialType = "congruent" | "incongruent";

export type FlankerTelemetryConsolidated = {
  finalScore: number;
  totalTrials: number;
  omissions: number; // No respondió a tiempo
  accuracyCongruentPercent: number;
  accuracyIncongruentPercent: number;
  avgReactionTimeCongruentMs: number;
  avgReactionTimeIncongruentMs: number;
};

interface FlankerConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  onPlayGood?: () => void;
  onPlayBad?: () => void;
  onFinish?: (score: number, telemetry: FlankerTelemetryConsolidated[]) => void;
}

type TurnRecord = {
  type: TrialType;
  success: boolean;
  reactionTimeMs: number;
  isTimeout: boolean;
};

export function useFlankerEngine({
  duration = 60,
  difficulty = "medium",
  onPlayGood,
  onPlayBad,
  onFinish,
}: FlankerConfig) {
  const settings = {
    // Incongruent Chance: % de veces que las naves de los lados apuntan al lado contrario
    easy: { timePerTurn: 4000, incongruentChance: 0.3 },
    medium: { timePerTurn: 3000, incongruentChance: 0.5 },
    hard: { timePerTurn: 2000, incongruentChance: 0.7 },
  }[difficulty];

  const [gameState, setGameState] = useState<GameState>("start");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // El arreglo de 5 direcciones. El índice 2 es el centro (el objetivo).
  const [currentFleet, setCurrentFleet] = useState<Direction[] | null>(null);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);

  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const turnStartTimeRef = useRef<number>(0);
  const hasAnsweredRef = useRef(false);
  const currentTypeRef = useRef<TrialType>("congruent");
  const targetDirectionRef = useRef<Direction>("right");

  const telemetryRef = useRef<TurnRecord[]>([]);

  const endTurn = useCallback(() => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);

    if (!hasAnsweredRef.current && currentFleet !== null) {
      // Omisión (Timeout)
      telemetryRef.current.push({
        type: currentTypeRef.current,
        success: false,
        reactionTimeMs: settings.timePerTurn,
        isTimeout: true,
      });
      setCombo(0);
    }

    setFeedback(null);
    hasAnsweredRef.current = false;

    // Generar nueva flota
    const isTargetLeft = Math.random() > 0.5;
    const targetDir: Direction = isTargetLeft ? "left" : "right";
    const isIncongruent = Math.random() < settings.incongruentChance;
    const flankerDir: Direction = isIncongruent
      ? isTargetLeft
        ? "right"
        : "left"
      : targetDir;

    targetDirectionRef.current = targetDir;
    currentTypeRef.current = isIncongruent ? "incongruent" : "congruent";

    setCurrentFleet([
      flankerDir,
      flankerDir,
      targetDir,
      flankerDir,
      flankerDir,
    ]);
    turnStartTimeRef.current = Date.now();

    turnTimerRef.current = setTimeout(() => {
      endTurn();
    }, settings.timePerTurn);
  }, [currentFleet, settings.timePerTurn, settings.incongruentChance]);

  const handleInput = useCallback(
    (guess: Direction) => {
      if (gameState !== "playing" || hasAnsweredRef.current) return;

      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
      hasAnsweredRef.current = true;

      const reactionTime = Date.now() - turnStartTimeRef.current;
      const isCorrect = guess === targetDirectionRef.current;

      telemetryRef.current.push({
        type: currentTypeRef.current,
        success: isCorrect,
        reactionTimeMs: reactionTime,
        isTimeout: false,
      });

      if (isCorrect) {
        setScore((s) => s + 100 + combo * 10);
        setCombo((c) => c + 1);
        setFeedback("hit");
        if (onPlayGood) onPlayGood();
      } else {
        setCombo(0);
        setFeedback("miss");
        if (onPlayBad) onPlayBad();
      }

      // Pequeña pausa visual antes del siguiente turno
      setTimeout(() => {
        if (gameState === "playing") endTurn();
      }, 500);
    },
    [gameState, combo, onPlayGood, onPlayBad, endTurn],
  );

  const finishGame = useCallback(() => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    setGameState("finished");
    setCurrentFleet(null);

    const records = telemetryRef.current;
    const congruent = records.filter((r) => r.type === "congruent");
    const incongruent = records.filter((r) => r.type === "incongruent");

    const calcAcc = (arr: TurnRecord[]) =>
      arr.length > 0
        ? Math.round((arr.filter((r) => r.success).length / arr.length) * 100)
        : 0;
    const calcRT = (arr: TurnRecord[]) => {
      const hits = arr.filter((r) => r.success && !r.isTimeout);
      return hits.length > 0
        ? Math.round(
            hits.reduce((a, b) => a + b.reactionTimeMs, 0) / hits.length,
          )
        : 0;
    };

    const consolidated: FlankerTelemetryConsolidated[] = [
      {
        finalScore: score,
        totalTrials: records.length,
        omissions: records.filter((r) => r.isTimeout).length,
        accuracyCongruentPercent: calcAcc(congruent),
        accuracyIncongruentPercent: calcAcc(incongruent),
        avgReactionTimeCongruentMs: calcRT(congruent),
        avgReactionTimeIncongruentMs: calcRT(incongruent),
      },
    ];

    if (onFinish) onFinish(score, consolidated);
  }, [score, onFinish]);

  const startGame = useCallback(() => {
    telemetryRef.current = [];
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    hasAnsweredRef.current = false;
    setGameState("playing");
    endTurn(); // Lanza el primer turno
  }, [duration, endTurn]);

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
    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, []);

  return {
    gameState,
    timeLeft,
    score,
    combo,
    currentFleet,
    feedback,
    startGame,
    handleInput,
  };
}
