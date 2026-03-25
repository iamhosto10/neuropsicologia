// src/hooks/useMultitaskEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";

export type GameObject = {
  id: number;
  type: "number" | "wall";
  x: number;
  y: number;
  value?: number;
  width: number;
  height: number;
  counted?: boolean;
  visible: boolean;
};

// 🔥 Telemetría Clínica para Atención Dividida
export type MultitaskTelemetry = {
  finalScore: number;
  survivalTimeSeconds: number;
  healthRemaining: number;
  wallsHit: number; // Fallo psicomotor
  correctNumbersCaught: number; // Acierto atencional
  incorrectNumbersCaught: number; // Impulsividad/Fallo de memoria de trabajo
  targetRule: "even" | "odd";
};

interface MultitaskConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  onPlayGood?: () => void;
  onPlayBad?: () => void;
  onPlayCrash?: () => void;
  onTriggerShake?: () => void;
  onFinish?: (score: number, telemetry: MultitaskTelemetry[]) => void;
}

const PLAYER_WIDTH = 8;
const PLAYER_HEIGHT = 8;
const PLAYER_Y = 82;

export function useMultitaskEngine({
  duration = 60,
  difficulty = "medium",
  onPlayGood,
  onPlayBad,
  onPlayCrash,
  onTriggerShake,
  onFinish,
}: MultitaskConfig) {
  const settings = {
    easy: { baseSpeed: 0.3, spawnRate: 2500, maxSpeed: 0.5 },
    medium: { baseSpeed: 0.5, spawnRate: 1500, maxSpeed: 0.8 },
    hard: { baseSpeed: 0.8, spawnRate: 1000, maxSpeed: 1.2 },
  }[difficulty];

  const [gameState, setGameState] = useState<GameState>("start");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [cargo, setCargo] = useState(0);
  const [targetRule, setTargetRule] = useState<"even" | "odd">("even");
  const [renderShipX, setRenderShipX] = useState(46);
  const [objects, setObjects] = useState<GameObject[]>([]);

  // Refs de alto rendimiento (evitan re-renders)
  const shipXRef = useRef(46);
  const speedRef = useRef(settings.baseSpeed);
  const gameActiveRef = useRef(false);
  const requestRef = useRef<number>(0);
  const objectsRef = useRef<GameObject[]>([]);

  // Refs de estado
  const healthRef = useRef(100);
  const scoreRef = useRef(0);
  const cargoRef = useRef(0);
  const targetRuleRef = useRef<"even" | "odd">("even");

  // Refs de Telemetría
  const startTimeRef = useRef(0);
  const statsRef = useRef({
    wallsHit: 0,
    correctNumbersCaught: 0,
    incorrectNumbersCaught: 0,
  });

  const callbacksRef = useRef({
    onPlayGood,
    onPlayBad,
    onPlayCrash,
    onTriggerShake,
    onFinish,
  });
  useEffect(() => {
    callbacksRef.current = {
      onPlayGood,
      onPlayBad,
      onPlayCrash,
      onTriggerShake,
      onFinish,
    };
  }, [onPlayGood, onPlayBad, onPlayCrash, onTriggerShake, onFinish]);

  const finishGame = useCallback(() => {
    gameActiveRef.current = false;
    cancelAnimationFrame(requestRef.current);
    setGameState("finished");

    const survivalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const telemetry: MultitaskTelemetry[] = [
      {
        finalScore: scoreRef.current,
        survivalTimeSeconds: Math.min(survivalTime, duration),
        healthRemaining: Math.max(0, healthRef.current),
        wallsHit: statsRef.current.wallsHit,
        correctNumbersCaught: statsRef.current.correctNumbersCaught,
        incorrectNumbersCaught: statsRef.current.incorrectNumbersCaught,
        targetRule: targetRuleRef.current,
      },
    ];

    if (callbacksRef.current.onFinish) {
      callbacksRef.current.onFinish(scoreRef.current, telemetry);
    }
  }, [duration]);

  const spawnObject = useCallback(() => {
    if (!gameActiveRef.current) return;

    const isNumber = Math.random() < 0.7;
    const newWidth = isNumber ? 8 : 12;
    const newHeight = isNumber ? 8 : 12;

    const newX = isNumber
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
      visible: true,
    };

    objectsRef.current.push(newObj);
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameActiveRef.current) return;

    let currentHealth = healthRef.current;
    let currentScore = scoreRef.current;
    let currentCargo = cargoRef.current;

    objectsRef.current.forEach((obj) => {
      obj.y += speedRef.current;
    });

    objectsRef.current = objectsRef.current.filter((obj) => obj.y < 120);

    const playerBox = {
      x: shipXRef.current,
      y: PLAYER_Y,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
    };

    objectsRef.current.forEach((obj) => {
      if (obj.counted || !obj.visible) return;

      const isColliding =
        obj.x < playerBox.x + playerBox.w &&
        obj.x + obj.width > playerBox.x &&
        obj.y < playerBox.y + playerBox.h &&
        obj.y + obj.height > playerBox.y;

      if (isColliding) {
        obj.counted = true;
        obj.visible = false;

        if (obj.type === "wall") {
          statsRef.current.wallsHit++;
          if (callbacksRef.current.onPlayCrash)
            callbacksRef.current.onPlayCrash();
          if (callbacksRef.current.onTriggerShake)
            callbacksRef.current.onTriggerShake();

          currentHealth = Math.max(0, currentHealth - 25);
          speedRef.current = Math.max(
            settings.baseSpeed,
            speedRef.current - 0.5,
          );
        } else if (obj.type === "number") {
          const isEven = obj.value! % 2 === 0;
          const isCorrect =
            (targetRuleRef.current === "even" && isEven) ||
            (targetRuleRef.current === "odd" && !isEven);

          if (isCorrect) {
            statsRef.current.correctNumbersCaught++;
            if (callbacksRef.current.onPlayGood)
              callbacksRef.current.onPlayGood();

            currentScore += 100;
            currentCargo += 1;
            speedRef.current = Math.min(
              settings.maxSpeed,
              speedRef.current + 0.05,
            );
          } else {
            statsRef.current.incorrectNumbersCaught++;
            if (callbacksRef.current.onPlayBad)
              callbacksRef.current.onPlayBad();
            if (callbacksRef.current.onTriggerShake)
              callbacksRef.current.onTriggerShake();

            currentHealth = Math.max(0, currentHealth - 15);
            speedRef.current = Math.max(
              settings.baseSpeed,
              speedRef.current - 0.2,
            );
          }
        }
      }
    });

    healthRef.current = currentHealth;
    scoreRef.current = currentScore;
    cargoRef.current = currentCargo;

    setRenderShipX(shipXRef.current);
    setObjects([...objectsRef.current]);

    setHealth((prev) => (prev !== currentHealth ? currentHealth : prev));
    setScore((prev) => (prev !== currentScore ? currentScore : prev));
    setCargo((prev) => (prev !== currentCargo ? currentCargo : prev));

    if (currentHealth <= 0) {
      finishGame();
      return;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [settings.baseSpeed, settings.maxSpeed, finishGame]);

  const handlePointerMove = useCallback((xPercentage: number) => {
    if (!gameActiveRef.current) return;
    let x = xPercentage - PLAYER_WIDTH / 2;
    shipXRef.current = Math.max(0, Math.min(x, 100 - PLAYER_WIDTH));
  }, []);

  const startGame = useCallback(() => {
    const rule = Math.random() > 0.5 ? "even" : "odd";
    setTargetRule(rule);
    targetRuleRef.current = rule;

    healthRef.current = 100;
    scoreRef.current = 0;
    cargoRef.current = 0;
    objectsRef.current = [];
    speedRef.current = settings.baseSpeed;
    shipXRef.current = 46;

    statsRef.current = {
      wallsHit: 0,
      correctNumbersCaught: 0,
      incorrectNumbersCaught: 0,
    };
    startTimeRef.current = Date.now();

    setScore(0);
    setHealth(100);
    setCargo(0);
    setTimeLeft(duration);

    gameActiveRef.current = true;
    setGameState("playing");
  }, [duration, settings.baseSpeed]);

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

  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
    };
  }, []);

  return {
    gameState,
    timeLeft,
    health,
    score,
    cargo,
    targetRule,
    objects,
    renderShipX,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    PLAYER_Y,
    startGame,
    handlePointerMove,
  };
}
