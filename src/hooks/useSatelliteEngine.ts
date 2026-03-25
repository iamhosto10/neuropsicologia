// src/hooks/useSatelliteEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";

// 🔥 ACTUALIZADO: Las nuevas métricas clínicas de alto valor
export type SatelliteTelemetry = {
  durationSeconds: number;
  finalScore: number;
  criticalEventsTriggered: number;
  criticalEventsCaught: number;
  falsePositives: number; // Impulsividad
  averageReactionTimeMs: number; // Procesamiento cognitivo
  timeOnTargetPercentage: number; // Atención sostenida
};

interface SatelliteConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  onCriticalEventTrigger?: () => void;
  onCriticalEventCatch?: () => void;
  onFinish?: (score: number, telemetry: SatelliteTelemetry[]) => void;
}

export function useSatelliteEngine({
  duration = 120,
  difficulty = "medium",
  onCriticalEventTrigger,
  onCriticalEventCatch,
  onFinish,
}: SatelliteConfig) {
  const settings = {
    easy: { speed: 4, drain: 0.5, eventChance: 0.005 },
    medium: { speed: 3, drain: 1, eventChance: 0.008 },
    hard: { speed: 2, drain: 2, eventChance: 0.01 },
  }[difficulty];

  const [gameState, setGameState] = useState<GameState>("start");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [signalQuality, setSignalQuality] = useState(50);
  const [isCriticalEvent, setIsCriticalEvent] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const gameActiveRef = useRef(false);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0); // Para calcular ms exactos

  // 🔥 NUEVO: Objeto de estadísticas clínicas ampliado
  const statsRef = useRef({
    triggered: 0,
    caught: 0,
    falsePositives: 0,
    reactionTimes: [] as number[],
    hoverTimeMs: 0,
    currentEventStartTime: 0,
  });

  const callbacksRef = useRef({
    onCriticalEventTrigger,
    onCriticalEventCatch,
    onFinish,
  });
  useEffect(() => {
    callbacksRef.current = {
      onCriticalEventTrigger,
      onCriticalEventCatch,
      onFinish,
    };
  }, [onCriticalEventTrigger, onCriticalEventCatch, onFinish]);

  const stateRefs = useRef({
    score: 0,
    signal: 50,
    isHovering: false,
    isCritical: false,
  });

  const setHovering = useCallback((hover: boolean) => {
    stateRefs.current.isHovering = hover;
  }, []);

  const triggerCriticalEvent = useCallback(() => {
    stateRefs.current.isCritical = true;
    setIsCriticalEvent(true);
    statsRef.current.triggered++;

    // 🔥 Registramos el momento exacto en que se pone rojo
    statsRef.current.currentEventStartTime = Date.now();

    if (callbacksRef.current.onCriticalEventTrigger)
      callbacksRef.current.onCriticalEventTrigger();

    setTimeout(() => {
      if (stateRefs.current.isCritical) {
        stateRefs.current.isCritical = false;
        setIsCriticalEvent(false);
      }
    }, 2000);
  }, []);

  // 🔥 NUEVO: Función para clics fuera del objetivo o a destiempo
  const handleFalsePositive = useCallback(() => {
    if (!gameActiveRef.current) return;
    statsRef.current.falsePositives++;
  }, []);

  const handleCriticalClick = useCallback(
    (e?: React.PointerEvent) => {
      if (!gameActiveRef.current) return;

      // Evitamos que el clic se propague al fondo (viewport)
      if (e) e.stopPropagation();

      if (stateRefs.current.isCritical) {
        // ✅ ACIERTO: Calculamos el tiempo de reacción en ms
        const reactionTime =
          Date.now() - statsRef.current.currentEventStartTime;
        statsRef.current.reactionTimes.push(reactionTime);

        statsRef.current.caught++;
        stateRefs.current.score += 1000;
        stateRefs.current.signal = 100;
        stateRefs.current.isCritical = false;
        setIsCriticalEvent(false);

        if (callbacksRef.current.onCriticalEventCatch)
          callbacksRef.current.onCriticalEventCatch();
      } else {
        // ❌ ERROR: Hizo clic en el satélite pero NO estaba rojo (Impulsividad)
        handleFalsePositive();
      }
    },
    [handleFalsePositive],
  );

  const moveToNewPosition = useCallback(() => {
    if (!gameActiveRef.current) return;
    setPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
  }, []);

  const finishGame = useCallback(() => {
    gameActiveRef.current = false;
    cancelAnimationFrame(requestRef.current);
    setGameState("finished");

    const totalTimeMs = Date.now() - startTimeRef.current;

    // Cálculos clínicos
    const avgReactionTime =
      statsRef.current.reactionTimes.length > 0
        ? Math.round(
            statsRef.current.reactionTimes.reduce((a, b) => a + b, 0) /
              statsRef.current.reactionTimes.length,
          )
        : 0;

    const hoverPercentage = Math.round(
      (statsRef.current.hoverTimeMs / totalTimeMs) * 100,
    );

    const telemetry: SatelliteTelemetry[] = [
      {
        durationSeconds: Math.floor(totalTimeMs / 1000),
        finalScore: stateRefs.current.score,
        criticalEventsTriggered: statsRef.current.triggered,
        criticalEventsCaught: statsRef.current.caught,
        falsePositives: statsRef.current.falsePositives,
        averageReactionTimeMs: avgReactionTime,
        timeOnTargetPercentage: Math.min(hoverPercentage, 100), // Tope del 100% por seguridad
      },
    ];

    if (callbacksRef.current.onFinish)
      callbacksRef.current.onFinish(stateRefs.current.score, telemetry);
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameActiveRef.current) return;

    const now = Date.now();
    const dt = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    if (stateRefs.current.isHovering) {
      // 🔥 Sumamos los ms reales que ha pasado haciendo hover
      statsRef.current.hoverTimeMs += dt;

      const boost = stateRefs.current.signal < 100 ? 0.5 : 0;
      if (stateRefs.current.signal >= 100) stateRefs.current.score += 5;
      stateRefs.current.signal = Math.min(
        stateRefs.current.signal + boost,
        100,
      );
    } else {
      stateRefs.current.signal = Math.max(
        stateRefs.current.signal - settings.drain,
        0,
      );
    }

    if (!stateRefs.current.isCritical && Math.random() < settings.eventChance) {
      triggerCriticalEvent();
    }

    setSignalQuality(stateRefs.current.signal);
    setScore(stateRefs.current.score);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [settings, triggerCriticalEvent]);

  const startGame = useCallback(() => {
    stateRefs.current = {
      score: 0,
      signal: 50,
      isHovering: false,
      isCritical: false,
    };
    statsRef.current = {
      triggered: 0,
      caught: 0,
      falsePositives: 0,
      reactionTimes: [],
      hoverTimeMs: 0,
      currentEventStartTime: 0,
    };

    const now = Date.now();
    startTimeRef.current = now;
    lastFrameTimeRef.current = now;

    setScore(0);
    setSignalQuality(50);
    setTimeLeft(duration);
    setIsCriticalEvent(false);
    setGameState("playing");
    gameActiveRef.current = true;

    setTimeout(() => moveToNewPosition(), 100);
  }, [duration, moveToNewPosition]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, gameLoop]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, finishGame]);

  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
    };
  }, []);

  return {
    gameState,
    timeLeft,
    score,
    signalQuality,
    isCriticalEvent,
    position,
    settings,
    startGame,
    isHovering: stateRefs.current.isHovering,
    setHovering,
    handleCriticalClick,
    handleFalsePositive, // 🔥 Exportamos esta función a la UI
    moveToNewPosition,
  };
}
