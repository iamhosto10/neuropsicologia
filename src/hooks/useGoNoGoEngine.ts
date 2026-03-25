// src/hooks/useGoNoGoEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";
export type StimulusType =
  | "waiting"
  | "go"
  | "no-go"
  | "feedback-hit"
  | "feedback-crash";

// Telemetría interna por evento
type TelemetryEvent = {
  stimulus: "go" | "no-go";
  reactionTimeMs: number;
  success: boolean;
  type: "hit" | "commission_error" | "correct_rejection" | "omission_error"; // Clasificación clínica
};

// 🔥 NUEVO: Telemetría Consolidada (Lo que le interesa al Terapeuta)
export type GoNoGoTelemetryConsolidated = {
  finalScore: number;
  maxCombo: number;
  totalStimuli: number;
  correctHits: number; // Clics correctos en GO
  correctRejections: number; // No hizo clic en NO-GO
  commissionErrors: number; // Impulsividad: Clic en NO-GO
  omissionErrors: number; // Inatención: No hizo clic en GO
  avgReactionTimeMs: number; // Velocidad de procesamiento en aciertos
};

interface EngineConfig {
  duration?: number;
  initialWindow?: number;
  minWindow?: number;
  speedIncrement?: number;
  onHit?: (combo: number) => void;
  onCrash?: () => void;
  onFinish?: (score: number, telemetry: GoNoGoTelemetryConsolidated[]) => void;
}

export function useGoNoGoEngine({
  duration = 60,
  initialWindow = 1500,
  minWindow = 800,
  speedIncrement = 80,
  onHit,
  onCrash,
  onFinish,
}: EngineConfig) {
  const [gameState, setGameState] = useState<GameState>("start");
  const [currentStimulus, setCurrentStimulus] =
    useState<StimulusType>("waiting");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const reactionWindowRef = useRef(initialWindow);
  const speedLevelRef = useRef(1);
  const telemetryRef = useRef<TelemetryEvent[]>([]);
  const maxComboRef = useRef(0);
  const currentActualStimulusRef = useRef<"go" | "no-go" | null>(null);

  const clearGameTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const scheduleNextStimulus = useCallback(() => {
    setCurrentStimulus("waiting");
    currentActualStimulusRef.current = null;
    const baseDelay = Math.max(500, 1500 - speedLevelRef.current * 200);
    const finalDelay = baseDelay + Math.random() * 1000;

    clearGameTimer();
    timerRef.current = setTimeout(spawnStimulus, finalDelay);
  }, [clearGameTimer]);

  const spawnStimulus = useCallback(() => {
    const isGo = Math.random() < 0.7;
    const stim = isGo ? "go" : "no-go";
    setCurrentStimulus(stim);
    currentActualStimulusRef.current = stim;
    startTimeRef.current = Date.now();

    clearGameTimer();
    timerRef.current = setTimeout(() => {
      // Si se acaba el tiempo y no hizo nada
      handleFeedback(isGo ? "crash" : "hit", !isGo, true);
    }, reactionWindowRef.current);
  }, [clearGameTimer]);

  const handleFeedback = useCallback(
    (type: "hit" | "crash", success: boolean, isTimeout: boolean = false) => {
      const actualStimulus = currentActualStimulusRef.current;
      if (!actualStimulus) return;

      setCurrentStimulus(type === "hit" ? "feedback-hit" : "feedback-crash");

      const reactionTime = isTimeout
        ? reactionWindowRef.current
        : Date.now() - startTimeRef.current;

      // Clasificación clínica del evento
      let eventType: TelemetryEvent["type"] = "hit";
      if (actualStimulus === "go" && success) eventType = "hit";
      else if (actualStimulus === "no-go" && success)
        eventType = "correct_rejection"; // (Timeout exitoso en rojo)
      else if (actualStimulus === "no-go" && !success)
        eventType = "commission_error"; // Clic impulsivo en rojo
      else if (actualStimulus === "go" && !success)
        eventType = "omission_error"; // Faltó hacer clic en verde

      telemetryRef.current.push({
        stimulus: actualStimulus,
        reactionTimeMs: reactionTime,
        success,
        type: eventType,
      });

      if (success) {
        setCombo((c) => {
          const newCombo = c + 1;
          if (newCombo > maxComboRef.current) maxComboRef.current = newCombo;
          if (onHit) onHit(newCombo);
          setScore((s) => s + 100 * Math.min(newCombo, 5));
          return newCombo;
        });
        speedLevelRef.current = Math.min(speedLevelRef.current + 0.2, 5);
        reactionWindowRef.current = Math.max(
          reactionWindowRef.current - speedIncrement,
          minWindow,
        );
      } else {
        if (onCrash) onCrash();
        setCombo(0);
        speedLevelRef.current = Math.max(1, speedLevelRef.current - 0.5);
        reactionWindowRef.current = Math.min(
          reactionWindowRef.current + 200,
          initialWindow,
        );
      }

      clearGameTimer();
      timerRef.current = setTimeout(scheduleNextStimulus, 1000);
    },
    [
      clearGameTimer,
      minWindow,
      onCrash,
      onHit,
      scheduleNextStimulus,
      speedIncrement,
      initialWindow,
    ],
  );

  const handleAction = useCallback(() => {
    if (gameState !== "playing") return;
    if (currentStimulus !== "go" && currentStimulus !== "no-go") return;

    clearGameTimer();
    if (currentStimulus === "go") {
      handleFeedback("hit", true);
    } else if (currentStimulus === "no-go") {
      handleFeedback("crash", false); // Error de comisión (Impulsividad)
    }
  }, [gameState, currentStimulus, clearGameTimer, handleFeedback]);

  const startGame = useCallback(() => {
    clearGameTimer();
    telemetryRef.current = [];
    maxComboRef.current = 0;
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    speedLevelRef.current = 1;
    reactionWindowRef.current = initialWindow;
    setGameState("playing");
    scheduleNextStimulus();
  }, [clearGameTimer, duration, initialWindow, scheduleNextStimulus]);

  const finishGame = useCallback(() => {
    clearGameTimer();
    setGameState("finished");
    setCurrentStimulus("waiting");

    // 🔥 PROCESAMIENTO CLÍNICO: Consolidar datos
    const records = telemetryRef.current;
    const hits = records.filter((r) => r.type === "hit");

    const avgReaction =
      hits.length > 0
        ? Math.round(
            hits.reduce((acc, curr) => acc + curr.reactionTimeMs, 0) /
              hits.length,
          )
        : 0;

    const consolidatedTelemetry: GoNoGoTelemetryConsolidated[] = [
      {
        finalScore: score,
        maxCombo: maxComboRef.current,
        totalStimuli: records.length,
        correctHits: hits.length,
        correctRejections: records.filter((r) => r.type === "correct_rejection")
          .length,
        commissionErrors: records.filter((r) => r.type === "commission_error")
          .length, // Impulsividad
        omissionErrors: records.filter((r) => r.type === "omission_error")
          .length, // Inatención
        avgReactionTimeMs: avgReaction,
      },
    ];

    if (onFinish) onFinish(score, consolidatedTelemetry);
  }, [clearGameTimer, score, onFinish]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState === "playing") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleAction]);

  useEffect(() => {
    return () => clearGameTimer();
  }, [clearGameTimer]);

  return {
    gameState,
    currentStimulus,
    timeLeft,
    score,
    combo,
    startGame,
    handleAction,
  };
}
