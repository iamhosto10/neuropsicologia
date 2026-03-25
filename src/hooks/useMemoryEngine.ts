// src/hooks/useMemoryEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type GameState = "start" | "playing" | "finished";
export type Phase = "idle" | "showing" | "waiting" | "input" | "feedback";

// Telemetría interna por ronda
type RoundRecord = {
  level: number;
  sequenceLength: number;
  isReverse: boolean;
  success: boolean;
  reactionTimeMs: number;
};

// 🔥 NUEVO: Telemetría Consolidada (Lo que le interesa al Terapeuta)
export type MemoryTelemetryConsolidated = {
  finalScore: number;
  highestLevelReached: number;
  totalRounds: number;
  maxSequenceDirect: number; // Corsi Span Directo
  maxSequenceReverse: number; // Corsi Span Inverso
  accuracyDirectPercent: number;
  accuracyReversePercent: number;
};

interface MemoryConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
  onLightUp?: () => void;
  onPlayVoice?: (isReverse: boolean) => void;
  onPress?: () => void;
  onFeedback?: (success: boolean) => void;
  onFinish?: (score: number, telemetry: MemoryTelemetryConsolidated[]) => void;
}

export function useMemoryEngine({
  duration = 60,
  difficulty = "medium",
  onLightUp,
  onPlayVoice,
  onPress,
  onFeedback,
  onFinish,
}: MemoryConfig) {
  const settings = {
    easy: { startLength: 3, maxLength: 5, reverseChance: 0, speed: 800 },
    medium: { startLength: 4, maxLength: 6, reverseChance: 0.3, speed: 600 },
    hard: { startLength: 5, maxLength: 8, reverseChance: 0.5, speed: 400 },
  }[difficulty];

  const [gameState, setGameState] = useState<GameState>("start");
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);

  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [isReverse, setIsReverse] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [userStepIndex, setUserStepIndex] = useState(0);
  const [securityLevel, setSecurityLevel] = useState(1);
  const [currentLengthUI, setCurrentLengthUI] = useState(settings.startLength);

  const gameActiveRef = useRef(false);
  const currentLengthRef = useRef(settings.startLength);
  const telemetryRef = useRef<RoundRecord[]>([]);
  const roundStartTimeRef = useRef<number>(0);

  const generateSequence = useCallback((length: number) => {
    const newSeq = [];
    let lastNum = -1;
    for (let i = 0; i < length; i++) {
      let nextNum;
      do {
        nextNum = Math.floor(Math.random() * 9);
      } while (nextNum === lastNum);
      newSeq.push(nextNum);
      lastNum = nextNum;
    }
    return newSeq;
  }, []);

  const playSequence = useCallback(
    async (sequence: number[], reverseModus: boolean) => {
      setPhase("showing");
      if (onPlayVoice) onPlayVoice(reverseModus);
      await sleep(1000);

      for (let i = 0; i < sequence.length; i++) {
        if (!gameActiveRef.current) return;
        setActiveButton(sequence[i]);
        if (onLightUp) onLightUp();
        await sleep(settings.speed);
        setActiveButton(null);
        await sleep(settings.speed / 2);
      }

      if (!gameActiveRef.current) return;
      setPhase("waiting");
      await sleep(1500);

      if (gameActiveRef.current) {
        setPhase("input");
        roundStartTimeRef.current = Date.now();
      }
    },
    [settings.speed, onLightUp, onPlayVoice],
  );

  const startRound = useCallback(async () => {
    if (!gameActiveRef.current) return;
    setUserStepIndex(0);
    const reverse = Math.random() < settings.reverseChance;
    setIsReverse(reverse);
    const seq = generateSequence(currentLengthRef.current);
    setCurrentSequence(seq);
    await playSequence(seq, reverse);
  }, [generateSequence, playSequence, settings.reverseChance]);

  const handleInput = async (index: number) => {
    if (phase !== "input" || !gameActiveRef.current) return;
    if (onPress) onPress();

    setActiveButton(index);
    setTimeout(() => {
      if (gameActiveRef.current) setActiveButton(null);
    }, 200);

    const expectedSequence = isReverse
      ? [...currentSequence].reverse()
      : currentSequence;
    const expectedIndex = expectedSequence[userStepIndex];

    if (index === expectedIndex) {
      const nextStep = userStepIndex + 1;
      setUserStepIndex(nextStep);

      if (nextStep === currentSequence.length) {
        // ACIERTO TOTAL
        const reactionTime = Date.now() - roundStartTimeRef.current;
        telemetryRef.current.push({
          level: securityLevel,
          sequenceLength: currentLengthRef.current,
          isReverse,
          success: true,
          reactionTimeMs: reactionTime,
        });

        setPhase("feedback");
        if (onFeedback) onFeedback(true);
        const points = currentLengthRef.current * 100 * (isReverse ? 2 : 1);
        setScore((s) => s + points);
        setSecurityLevel((l) => l + 1);

        if (currentLengthRef.current < settings.maxLength) {
          currentLengthRef.current += 1;
          setCurrentLengthUI(currentLengthRef.current);
        }

        await sleep(1500);
        if (gameActiveRef.current) startRound();
      }
    } else {
      // ERROR
      const reactionTime = Date.now() - roundStartTimeRef.current;
      telemetryRef.current.push({
        level: securityLevel,
        sequenceLength: currentLengthRef.current,
        isReverse,
        success: false,
        reactionTimeMs: reactionTime,
      });

      setPhase("feedback");
      if (onFeedback) onFeedback(false);

      if (currentLengthRef.current > settings.startLength) {
        currentLengthRef.current -= 1;
        setCurrentLengthUI(currentLengthRef.current);
      }

      await sleep(2000);
      if (gameActiveRef.current) startRound();
    }
  };

  const startGame = () => {
    telemetryRef.current = [];
    setScore(0);
    setTimeLeft(duration);
    currentLengthRef.current = settings.startLength;
    setCurrentLengthUI(settings.startLength);
    setSecurityLevel(1);
    gameActiveRef.current = true;
    setGameState("playing");
    setTimeout(startRound, 800);
  };

  const finishGame = useCallback(() => {
    gameActiveRef.current = false;
    setPhase("idle");
    setGameState("finished");

    // 🔥 PROCESAMIENTO CLÍNICO: Consolidar datos
    const records = telemetryRef.current;

    const directRecords = records.filter((r) => !r.isReverse);
    const reverseRecords = records.filter((r) => r.isReverse);

    const getAccuracy = (arr: RoundRecord[]) =>
      arr.length > 0
        ? Math.round((arr.filter((r) => r.success).length / arr.length) * 100)
        : 0;

    // Calcular el Span (Longitud máxima lograda con éxito)
    const getMaxSpan = (arr: RoundRecord[]) => {
      const successes = arr.filter((r) => r.success);
      if (successes.length === 0) return 0;
      return Math.max(...successes.map((r) => r.sequenceLength));
    };

    const consolidatedTelemetry: MemoryTelemetryConsolidated[] = [
      {
        finalScore: score,
        highestLevelReached: securityLevel,
        totalRounds: records.length,
        maxSequenceDirect: getMaxSpan(directRecords),
        maxSequenceReverse: getMaxSpan(reverseRecords),
        accuracyDirectPercent: getAccuracy(directRecords),
        accuracyReversePercent: getAccuracy(reverseRecords),
      },
    ];

    if (onFinish) onFinish(score, consolidatedTelemetry);
  }, [score, securityLevel, onFinish]);

  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0) finishGame();
  }, [timeLeft, gameState, finishGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
    };
  }, []);

  return {
    gameState,
    phase,
    timeLeft,
    score,
    isReverse,
    activeButton,
    userStepIndex,
    securityLevel,
    currentLengthUI,
    startGame,
    handleInput,
  };
}
