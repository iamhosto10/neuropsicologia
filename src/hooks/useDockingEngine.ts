import { useState, useRef, useCallback, useEffect } from "react";

interface DockingConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface DockingTelemetry {
  totalAttempts: number;
  successfulDocks: number;
  failedDocks: number;
  averageErrorMargin: number; // En grados (qué tan desviado estaba al intentar acoplar)
  averageDecisionTime: number; // En milisegundos
}

export function useDockingEngine(
  config: DockingConfig,
  onFinish?: (telemetry: DockingTelemetry, finalScore: number) => void,
) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  // --- CONFIGURACIÓN CLÍNICA ---
  const settings = {
    easy: { errorMargin: 25, rotationStep: 15 }, // ±25 grados de tolerancia
    medium: { errorMargin: 15, rotationStep: 10 },
    hard: { errorMargin: 5, rotationStep: 5 }, // Muy estricto
  }[difficulty];

  // --- ESTADOS ---
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);

  // Físicas
  const [targetAngle, setTargetAngle] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  // --- TELEMETRÍA (Refs para no causar re-renders innecesarios) ---
  const telemetry = useRef<DockingTelemetry>({
    totalAttempts: 0,
    successfulDocks: 0,
    failedDocks: 0,
    averageErrorMargin: 0,
    averageDecisionTime: 0,
  });
  const turnStartTime = useRef<number>(0);
  const totalErrorAccumulated = useRef<number>(0);
  const totalTimeAccumulated = useRef<number>(0);

  // --- LÓGICA CORE ---
  const generateNewTarget = useCallback(() => {
    // Generar un ángulo aleatorio múltiplo de 5, que no sea 0, 90, 180 o 270 (muy fáciles)
    let newAngle;
    do {
      newAngle = Math.floor(Math.random() * 72) * 5; // 0 a 355 en pasos de 5
    } while (newAngle % 90 === 0);

    setTargetAngle(newAngle);
    setCurrentAngle(0); // La nave siempre empieza alineada hacia arriba
    setFeedback(null);
    turnStartTime.current = Date.now();
  }, []);

  const rotate = useCallback(
    (direction: "left" | "right") => {
      if (gameState !== "playing" || feedback !== null) return;

      setCurrentAngle((prev) => {
        let newAngle =
          direction === "right"
            ? prev + settings.rotationStep
            : prev - settings.rotationStep;
        // Normalizar entre 0 y 359
        if (newAngle >= 360) newAngle -= 360;
        if (newAngle < 0) newAngle += 360;
        return newAngle;
      });
    },
    [gameState, feedback, settings.rotationStep],
  );

  const attemptDock = useCallback(() => {
    if (gameState !== "playing" || feedback !== null) return;

    const decisionTime = Date.now() - turnStartTime.current;
    telemetry.current.totalAttempts += 1;
    totalTimeAccumulated.current += decisionTime;

    // Calcular la diferencia más corta entre ángulos (teniendo en cuenta el salto 359 -> 0)
    let diff = Math.abs(targetAngle - currentAngle);
    if (diff > 180) diff = 360 - diff;

    totalErrorAccumulated.current += diff;

    const isSuccess = diff <= settings.errorMargin;

    if (isSuccess) {
      setFeedback("success");
      setScore((s) => s + 100 + Math.max(0, 30 - diff)); // Puntos extra por ser más preciso
      telemetry.current.successfulDocks += 1;
    } else {
      setFeedback("error");
      telemetry.current.failedDocks += 1;
    }

    // Pasar a la siguiente estación después del feedback visual
    setTimeout(() => {
      if (gameState === "playing") generateNewTarget();
    }, 1000);
  }, [
    currentAngle,
    targetAngle,
    gameState,
    feedback,
    settings.errorMargin,
    generateNewTarget,
  ]);

  // --- CRONÓMETRO Y FINALIZACIÓN ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      finishGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(duration);
    telemetry.current = {
      totalAttempts: 0,
      successfulDocks: 0,
      failedDocks: 0,
      averageErrorMargin: 0,
      averageDecisionTime: 0,
    };
    totalErrorAccumulated.current = 0;
    totalTimeAccumulated.current = 0;
    setGameState("playing");
    generateNewTarget();
  };

  const finishGame = () => {
    setGameState("finished");
    // Calcular promedios finales para la telemetría
    if (telemetry.current.totalAttempts > 0) {
      telemetry.current.averageErrorMargin = Math.round(
        totalErrorAccumulated.current / telemetry.current.totalAttempts,
      );
      telemetry.current.averageDecisionTime = Math.round(
        totalTimeAccumulated.current / telemetry.current.totalAttempts,
      );
    }
    if (onFinish) onFinish(telemetry.current, score);
  };

  return {
    gameState,
    timeLeft,
    score,
    targetAngle,
    currentAngle,
    feedback,
    settings,
    actions: { startGame, rotate, attemptDock },
  };
}
