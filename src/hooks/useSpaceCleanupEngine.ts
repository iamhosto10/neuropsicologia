// src/hooks/useSpaceCleanupEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";
export type GameResult = "win" | "lose" | null;

export type GameObject = {
  id: number;
  x: number;
  type: "target" | "distractor";
  rotation: number;
  speed: number;
  imageUrl?: string;
};

export type SpaceCleanupTelemetry = {
  durationSeconds: number;
  finalScore: number;
  finalEnergy: number;
  correctClicks: number;
  incorrectClicks: number;
  result: "win" | "lose";
};

interface SpaceCleanupConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  targetImage?: string;
  distractorImages?: string[];
  onHit?: () => void;
  onMiss?: () => void;
  onTriggerGlitch?: () => void;
  onFinish?: (score: number, telemetry: SpaceCleanupTelemetry[]) => void;
}

export function useSpaceCleanupEngine({
  duration = 60,
  difficulty = "medium",
  targetImage,
  distractorImages,
  onHit,
  onMiss,
  onTriggerGlitch,
  onFinish,
}: SpaceCleanupConfig) {
  const settings = {
    easy: { spawnRate: 1500, speed: 8, damage: 20 },
    medium: { spawnRate: 1000, speed: 6, damage: 25 },
    hard: { spawnRate: 600, speed: 3, damage: 34 },
  }[difficulty];

  const [gameState, setGameState] = useState<GameState>("start");
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [items, setItems] = useState<GameObject[]>([]);
  const [timeLeft, setTimeLeft] = useState(duration);

  const gameActiveRef = useRef(false);
  const startTimeRef = useRef(0);

  // Usamos refs para mantener la verdad absoluta y evitar bugs de asincronía en React
  const stateRefs = useRef({ score: 0, energy: 100, correct: 0, incorrect: 0 });

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const finishGame = useCallback((result: "win" | "lose") => {
    if (!gameActiveRef.current) return;
    gameActiveRef.current = false;

    setGameState("finished");
    setGameResult(result);
    setItems([]);

    const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const telemetry: SpaceCleanupTelemetry[] = [
      {
        durationSeconds: timePlayed,
        finalScore: stateRefs.current.score,
        finalEnergy: stateRefs.current.energy,
        correctClicks: stateRefs.current.correct,
        incorrectClicks: stateRefs.current.incorrect,
        result,
      },
    ];

    if (onFinishRef.current) {
      onFinishRef.current(stateRefs.current.score, telemetry);
    }
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleInteraction = useCallback(
    (item: GameObject) => {
      if (!gameActiveRef.current) return;

      if (item.type === "target") {
        stateRefs.current.correct++;
        if (onHit) onHit();
        stateRefs.current.score += 100;
        stateRefs.current.energy = Math.min(stateRefs.current.energy + 5, 100);
      } else {
        stateRefs.current.incorrect++;
        if (onMiss) onMiss();
        if (onTriggerGlitch) onTriggerGlitch();

        // Restamos la energía
        stateRefs.current.energy = Math.max(
          stateRefs.current.energy - settings.damage,
          0,
        );

        // SOLUCIÓN 1: Restamos 50 puntos como penalización
        stateRefs.current.score = Math.max(stateRefs.current.score - 50, 0);
      }

      // Forzamos actualización visual segura
      setScore(stateRefs.current.score);
      setEnergy(stateRefs.current.energy);
      removeItem(item.id);

      // SOLUCIÓN 2: Verificamos el fin del juego fuera del ciclo de actualización del estado
      if (stateRefs.current.energy <= 0) {
        finishGame("lose");
      }
    },
    [settings.damage, onHit, onMiss, onTriggerGlitch, removeItem, finishGame],
  );

  const startGame = useCallback(() => {
    stateRefs.current = { score: 0, energy: 100, correct: 0, incorrect: 0 };
    startTimeRef.current = Date.now();

    setGameState("playing");
    setGameResult(null);
    setScore(0);
    setEnergy(100);
    setTimeLeft(duration);
    setItems([]);
    gameActiveRef.current = true;
  }, [duration]);

  useEffect(() => {
    let spawnInterval: NodeJS.Timeout;
    if (gameState === "playing") {
      spawnInterval = setInterval(() => {
        if (!gameActiveRef.current) return;

        const isTarget = Math.random() > 0.6;
        let selectedImage: string | undefined = undefined;

        if (isTarget) {
          selectedImage = targetImage;
        } else if (distractorImages && distractorImages.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * distractorImages.length,
          );
          selectedImage = distractorImages[randomIndex];
        }

        const newItem: GameObject = {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          type: isTarget ? "target" : "distractor",
          rotation: Math.random() * 360,
          speed: settings.speed + Math.random() * 2,
          imageUrl: selectedImage,
        };

        setItems((prev) => [...prev, newItem]);
      }, settings.spawnRate);
    }
    return () => clearInterval(spawnInterval);
  }, [gameState, settings, targetImage, distractorImages]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame("win");
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
    gameResult,
    score,
    energy,
    items,
    timeLeft,
    startGame,
    handleInteraction,
    removeItem,
  };
}
