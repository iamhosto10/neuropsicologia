// src/hooks/useSatelliteEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";

export type SatelliteTelemetry = {
  durationSeconds: number;
  finalScore: number;
  criticalEventsTriggered: number;
  criticalEventsCaught: number;
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

  // Refs de rendimiento
  const gameActiveRef = useRef(false);
  const requestRef = useRef<number>(0);
  const statsRef = useRef({ triggered: 0, caught: 0 });
  const startTimeRef = useRef(0); // NUEVO: Para calcular el tiempo jugado sin depender del estado

  // Refs para asegurar que las funciones no cambien en cada render
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

    if (callbacksRef.current.onCriticalEventTrigger)
      callbacksRef.current.onCriticalEventTrigger();

    setTimeout(() => {
      if (stateRefs.current.isCritical) {
        stateRefs.current.isCritical = false;
        setIsCriticalEvent(false);
      }
    }, 2000);
  }, []);

  const handleCriticalClick = useCallback(() => {
    if (stateRefs.current.isCritical) {
      statsRef.current.caught++;
      stateRefs.current.score += 1000;
      stateRefs.current.signal = 100;
      stateRefs.current.isCritical = false;
      setIsCriticalEvent(false);
      if (callbacksRef.current.onCriticalEventCatch)
        callbacksRef.current.onCriticalEventCatch();
    }
  }, []);

  const moveToNewPosition = useCallback(() => {
    if (!gameActiveRef.current) return;
    setPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
  }, []);

  const finishGame = useCallback(() => {
    gameActiveRef.current = false;
    cancelAnimationFrame(requestRef.current);
    setGameState("finished");

    const telemetry: SatelliteTelemetry[] = [
      {
        durationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
        finalScore: stateRefs.current.score,
        criticalEventsTriggered: statsRef.current.triggered,
        criticalEventsCaught: statsRef.current.caught,
      },
    ];

    if (callbacksRef.current.onFinish)
      callbacksRef.current.onFinish(stateRefs.current.score, telemetry);
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameActiveRef.current) return;

    if (stateRefs.current.isHovering) {
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
    statsRef.current = { triggered: 0, caught: 0 };
    startTimeRef.current = Date.now();

    setScore(0);
    setSignalQuality(50);
    setTimeLeft(duration);
    setIsCriticalEvent(false);
    setGameState("playing");
    gameActiveRef.current = true;

    setTimeout(() => moveToNewPosition(), 100);
  }, [duration, moveToNewPosition]);

  // 🔴 CORRECCIÓN 1: El Game Loop tiene su propio useEffect aislado
  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, gameLoop]);

  // 🔴 CORRECCIÓN 2: El Cronómetro corre de forma totalmente independiente
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
    moveToNewPosition,
  };
}
