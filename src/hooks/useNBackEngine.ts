// src/hooks/useNBackEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";

// Tipos de elementos si no hay imágenes configuradas
export const DEFAULT_SYMBOLS = ["📦", "🔋", "🔧", "🛰️", "🧪", "💎"];

export type NBackTelemetryConsolidated = {
  finalScore: number;
  totalStimuli: number;
  truePositives: number; // Aciertos: Era repetido y dijo repetido
  trueNegatives: number; // Aciertos: Era nuevo y dijo nuevo
  falsePositives: number; // Impulsividad: Era nuevo y dijo repetido
  falseNegatives: number; // Inatención (Omisión): Era repetido y dijo nuevo o no respondió
  avgReactionTimeMs: number;
};

interface NBackConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  symbols?: string[]; // Array de URLs de imágenes (o emojis por defecto)
  onPlayGood?: () => void;
  onPlayBad?: () => void;
  onFinish?: (score: number, telemetry: NBackTelemetryConsolidated[]) => void;
}

export function useNBackEngine({
  duration = 60,
  difficulty = "medium",
  symbols = DEFAULT_SYMBOLS,
  onPlayGood,
  onPlayBad,
  onFinish,
}: NBackConfig) {
  const settings = {
    // nBack: 1 significa que compara con el anterior. Tiempo por turno ajustado a la dificultad.
    easy: { nBack: 1, timePerTurn: 3000, matchProbability: 0.3 },
    medium: { nBack: 1, timePerTurn: 2000, matchProbability: 0.35 },
    hard: { nBack: 2, timePerTurn: 2000, matchProbability: 0.4 }, // 2-Back para difícil (muy complejo)
  }[difficulty];

  const [gameState, setGameState] = useState<GameState>("start");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);

  const sequenceRef = useRef<string[]>([]);
  const currentIndexRef = useRef(-1);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const turnStartTimeRef = useRef<number>(0);
  const hasAnsweredRef = useRef(false);

  // Telemetría
  const statsRef = useRef({
    truePositives: 0,
    trueNegatives: 0,
    falsePositives: 0,
    falseNegatives: 0,
    reactionTimes: [] as number[],
  });

  const generateSequence = useCallback(() => {
    // Generamos suficientes items para la duración máxima
    const totalTurns = Math.ceil((duration * 1000) / settings.timePerTurn) + 5;
    const seq: string[] = [];

    for (let i = 0; i < totalTurns; i++) {
      if (i >= settings.nBack && Math.random() < settings.matchProbability) {
        // Forzamos un Match (Repetido)
        seq.push(seq[i - settings.nBack]);
      } else {
        // Forzamos un Non-Match (Nuevo)
        let newItem;
        do {
          newItem = symbols[Math.floor(Math.random() * symbols.length)];
        } while (i >= settings.nBack && newItem === seq[i - settings.nBack]);
        seq.push(newItem);
      }
    }
    sequenceRef.current = seq;
  }, [duration, settings, symbols]);

  const endTurnAndProceed = useCallback(
    (isTimeout = false) => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);

      const idx = currentIndexRef.current;
      if (idx >= settings.nBack && !hasAnsweredRef.current) {
        // Ocurrió una omisión (Timeout)
        const isMatch =
          sequenceRef.current[idx] ===
          sequenceRef.current[idx - settings.nBack];
        if (isMatch) {
          statsRef.current.falseNegatives++; // Era repetido y se le pasó (Inatención)
          setCombo(0);
        } else {
          statsRef.current.trueNegatives++; // Era nuevo y lo ignoró (Técnicamente correcto, pero pasivo)
        }
      }

      setFeedback(null);
      hasAnsweredRef.current = false;
      currentIndexRef.current++;

      if (
        currentIndexRef.current >= sequenceRef.current.length ||
        timeLeft <= 0
      ) {
        return; // El useEffect del reloj se encargará de terminar
      }

      setCurrentItem(sequenceRef.current[currentIndexRef.current]);
      turnStartTimeRef.current = Date.now();

      turnTimerRef.current = setTimeout(() => {
        endTurnAndProceed(true);
      }, settings.timePerTurn);
    },
    [settings.nBack, settings.timePerTurn, timeLeft],
  );

  const handleInput = useCallback(
    (guess: "match" | "new") => {
      if (gameState !== "playing" || hasAnsweredRef.current) return;
      const idx = currentIndexRef.current;

      // Los primeros turnos no se pueden comparar hacia atrás
      if (idx < settings.nBack) {
        if (guess === "new") {
          if (onPlayGood) onPlayGood();
          setFeedback("hit");
        } else {
          if (onPlayBad) onPlayBad();
          setFeedback("miss");
        }
        hasAnsweredRef.current = true;
        return;
      }

      hasAnsweredRef.current = true;
      const reactionTime = Date.now() - turnStartTimeRef.current;
      statsRef.current.reactionTimes.push(reactionTime);

      const isActualMatch =
        sequenceRef.current[idx] === sequenceRef.current[idx - settings.nBack];
      const isGuessMatch = guess === "match";

      if (isActualMatch && isGuessMatch) {
        // ¡Acierto! Dijo repetido y era repetido
        statsRef.current.truePositives++;
        setScore((s) => s + 100 + combo * 10);
        setCombo((c) => c + 1);
        setFeedback("hit");
        if (onPlayGood) onPlayGood();
      } else if (!isActualMatch && !isGuessMatch) {
        // ¡Acierto! Dijo nuevo y era nuevo
        statsRef.current.trueNegatives++;
        setScore((s) => s + 50);
        setCombo((c) => c + 1);
        setFeedback("hit");
        if (onPlayGood) onPlayGood();
      } else if (!isActualMatch && isGuessMatch) {
        // Fallo: Dijo repetido pero era nuevo (Impulsividad / Falsa Alarma)
        statsRef.current.falsePositives++;
        setCombo(0);
        setFeedback("miss");
        if (onPlayBad) onPlayBad();
      } else if (isActualMatch && !isGuessMatch) {
        // Fallo: Dijo nuevo pero era repetido (Fallo de memoria de trabajo)
        statsRef.current.falseNegatives++;
        setCombo(0);
        setFeedback("miss");
        if (onPlayBad) onPlayBad();
      }
    },
    [gameState, combo, settings.nBack, onPlayGood, onPlayBad],
  );

  const startGame = useCallback(() => {
    generateSequence();
    currentIndexRef.current = -1;
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    hasAnsweredRef.current = false;

    statsRef.current = {
      truePositives: 0,
      trueNegatives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      reactionTimes: [],
    };

    setGameState("playing");
    endTurnAndProceed();
  }, [duration, generateSequence, endTurnAndProceed]);

  const finishGame = useCallback(() => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    setGameState("finished");
    setCurrentItem(null);

    const rtArray = statsRef.current.reactionTimes;
    const avgReaction =
      rtArray.length > 0
        ? Math.round(rtArray.reduce((a, b) => a + b, 0) / rtArray.length)
        : 0;

    const telemetry: NBackTelemetryConsolidated[] = [
      {
        finalScore: score,
        totalStimuli: currentIndexRef.current,
        truePositives: statsRef.current.truePositives,
        trueNegatives: statsRef.current.trueNegatives,
        falsePositives: statsRef.current.falsePositives,
        falseNegatives: statsRef.current.falseNegatives,
        avgReactionTimeMs: avgReaction,
      },
    ];

    if (onFinish) onFinish(score, telemetry);
  }, [score, onFinish]);

  // Reloj General
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
    currentItem,
    feedback,
    nBack: settings.nBack,
    startGame,
    handleInput,
  };
}
