// src/hooks/useSymbolDigitEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";

export type SymbolDigitTelemetry = {
  finalScore: number;
  totalAttempts: number;
  correctMatches: number;
  incorrectMatches: number;
  accuracyPercent: number;
  avgReactionTimeMs: number;
};

interface SymbolDigitConfig {
  duration?: number;
  onPlayGood?: () => void;
  onPlayBad?: () => void;
  onFinish?: (score: number, telemetry: SymbolDigitTelemetry[]) => void;
}

const ALIEN_SYMBOLS = ["🪐", "☄️", "🛸", "👾", "🚀", "🛰️", "🌌", "⭐", "🌙"];

export function useSymbolDigitEngine({
  duration = 60,
  onPlayGood,
  onPlayBad,
  onFinish,
}: SymbolDigitConfig) {
  const [gameState, setGameState] = useState<GameState>("start");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const [legend, setLegend] = useState<{ digit: number; symbol: string }[]>([]);
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);

  const gameActiveRef = useRef(false);
  const currentDigitRef = useRef<number | null>(null);
  const turnStartTimeRef = useRef<number>(0);

  const telemetryRef = useRef({
    correct: 0,
    incorrect: 0,
    reactionTimes: [] as number[],
  });

  const nextTrial = useCallback(
    (currentLegend: { digit: number; symbol: string }[]) => {
      // Escoger un símbolo aleatorio de la leyenda
      const randomItem =
        currentLegend[Math.floor(Math.random() * currentLegend.length)];
      setCurrentSymbol(randomItem.symbol);
      currentDigitRef.current = randomItem.digit;
      turnStartTimeRef.current = Date.now();
      setFeedback(null);
    },
    [],
  );

  const startGame = useCallback(() => {
    // 1. Barajar símbolos
    const shuffledSymbols = [...ALIEN_SYMBOLS].sort(() => Math.random() - 0.5);

    // 2. Crear la leyenda (asignar un dígito del 1 al 9 a cada símbolo)
    const newLegend = shuffledSymbols.map((sym, index) => ({
      digit: index + 1,
      symbol: sym,
    }));

    setLegend(newLegend);
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    telemetryRef.current = { correct: 0, incorrect: 0, reactionTimes: [] };

    gameActiveRef.current = true;
    setGameState("playing");
    nextTrial(newLegend);
  }, [duration, nextTrial]);

  const handleInput = useCallback(
    (digit: number) => {
      if (!gameActiveRef.current || currentDigitRef.current === null) return;

      const reactionTime = Date.now() - turnStartTimeRef.current;
      const isCorrect = digit === currentDigitRef.current;

      telemetryRef.current.reactionTimes.push(reactionTime);

      if (isCorrect) {
        telemetryRef.current.correct++;
        setScore((s) => s + 50 + combo * 5);
        setCombo((c) => c + 1);
        setFeedback("hit");
        if (onPlayGood) onPlayGood();
      } else {
        telemetryRef.current.incorrect++;
        setCombo(0);
        setFeedback("miss");
        if (onPlayBad) onPlayBad();
      }

      // Pasar al siguiente casi inmediatamente para mantener el ritmo rápido (SDMT)
      setTimeout(() => {
        if (gameActiveRef.current) nextTrial(legend);
      }, 150);
    },
    [combo, legend, nextTrial, onPlayGood, onPlayBad],
  );

  const finishGame = useCallback(() => {
    gameActiveRef.current = false;
    setGameState("finished");
    setCurrentSymbol(null);

    const stats = telemetryRef.current;
    const total = stats.correct + stats.incorrect;
    const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
    const avgRT =
      stats.reactionTimes.length > 0
        ? Math.round(
            stats.reactionTimes.reduce((a, b) => a + b, 0) /
              stats.reactionTimes.length,
          )
        : 0;

    const consolidated: SymbolDigitTelemetry[] = [
      {
        finalScore: score,
        totalAttempts: total,
        correctMatches: stats.correct,
        incorrectMatches: stats.incorrect,
        accuracyPercent: accuracy,
        avgReactionTimeMs: avgRT,
      },
    ];

    if (onFinish) onFinish(score, consolidated);
  }, [score, onFinish]);

  // Reloj
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

  return {
    gameState,
    timeLeft,
    score,
    combo,
    legend,
    currentSymbol,
    feedback,
    startGame,
    handleInput,
  };
}
