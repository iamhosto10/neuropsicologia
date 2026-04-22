import { useState, useRef, useCallback, useEffect } from "react";

// Un tubo es un array de strings (colores). El índice 0 es el fondo, el final del array es la superficie.
export type Tube = string[];

interface WaterSortConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface WaterSortTelemetry {
  totalMoves: number;
  invalidPours: number; // Intentó echar agua donde no cabía o en un color distinto
  undosUsed: number; // Capacidad de corrección de errores
  stagesCompleted: number;
  averageDecisionTimeMs: number;
}

const TUBE_CAPACITY = 4; // Máximo 4 capas de agua por tubo

export function useWaterSortEngine(
  config: WaterSortConfig,
  onFinish?: (telemetry: WaterSortTelemetry, finalScore: number) => void,
) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [currentStage, setCurrentStage] = useState(1);

  const [tubes, setTubes] = useState<Tube[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);

  // Historial para el botón "Deshacer" (Undo)
  const [history, setHistory] = useState<Tube[][]>([]);

  const telemetry = useRef<WaterSortTelemetry>({
    totalMoves: 0,
    invalidPours: 0,
    undosUsed: 0,
    stagesCompleted: 0,
    averageDecisionTimeMs: 0,
  });
  const turnStartTime = useRef<number>(0);
  const totalTimeAccumulated = useRef<number>(0);

  // --- GENERADOR DE NIVELES (Plantillas Seguras para evitar Deadlocks) ---
  const loadLevel = useCallback(
    (stage: number) => {
      let newTubes: Tube[] = [];
      const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-400",
        "bg-purple-500",
        "bg-cyan-400",
        "bg-orange-500",
      ];

      let complexity = 1;
      if (difficulty === "easy") complexity = stage === 1 ? 1 : 2;
      else if (difficulty === "medium") complexity = stage <= 2 ? stage + 1 : 3;
      else complexity = stage === 1 ? 3 : 4;

      // Asignamos colores aleatorios de nuestra paleta para que cada jugada se sienta única
      const c = [...colors].sort(() => Math.random() - 0.5);

      if (complexity === 1) {
        // Fácil: 3 tubos (2 llenos, 1 vacío)
        newTubes = [[c[0], c[1], c[0], c[1]], [c[1], c[0], c[1], c[0]], []];
      } else if (complexity === 2) {
        // Medio: 5 tubos (3 llenos, 2 vacíos)
        newTubes = [
          [c[0], c[1], c[2], c[0]],
          [c[1], c[2], c[0], c[1]],
          [c[2], c[0], c[1], c[2]],
          [],
          [],
        ];
      } else if (complexity === 3) {
        // Difícil: 7 tubos (5 llenos, 2 vacíos)
        newTubes = [
          [c[0], c[1], c[2], c[3]],
          [c[1], c[2], c[3], c[4]],
          [c[2], c[3], c[4], c[0]],
          [c[3], c[4], c[0], c[1]],
          [c[4], c[0], c[1], c[2]],
          [],
          [],
        ];
      } else {
        // Extremo: 9 tubos (7 llenos, 2 vacíos)
        newTubes = [
          [c[0], c[1], c[2], c[3]],
          [c[4], c[5], c[6], c[0]],
          [c[1], c[2], c[3], c[4]],
          [c[5], c[6], c[0], c[1]],
          [c[2], c[3], c[4], c[5]],
          [c[6], c[0], c[1], c[2]],
          [c[3], c[4], c[5], c[6]],
          [],
          [],
        ];
      }

      setTubes(newTubes);
      setHistory([]); // Limpiar historial al cambiar de nivel
      setSelectedTube(null);
      turnStartTime.current = Date.now();
    },
    [difficulty],
  );

  // --- LÓGICA DE DERRAME DE FLUIDOS ---
  const handleTubeClick = useCallback(
    (index: number) => {
      if (gameState !== "playing") return;

      // Acción 1: Seleccionar un tubo
      if (selectedTube === null) {
        // Solo puedes seleccionar un tubo si tiene agua
        if (tubes[index].length > 0) {
          setSelectedTube(index);
        }
        return;
      }

      // Acción 2: Deseleccionar si hace clic en el mismo
      if (selectedTube === index) {
        setSelectedTube(null);
        return;
      }

      // Acción 3: Intentar verter agua de `selectedTube` a `index`
      const sourceTube = [...tubes[selectedTube]];
      const targetTube = [...tubes[index]];

      // Reglas de validación clínica:
      const sourceTopColor = sourceTube[sourceTube.length - 1];
      const targetTopColor =
        targetTube.length > 0 ? targetTube[targetTube.length - 1] : null;
      const isTargetFull = targetTube.length >= TUBE_CAPACITY;
      const isColorMatch =
        targetTopColor === null || targetTopColor === sourceTopColor;

      if (isTargetFull || !isColorMatch) {
        // ERROR: Movimiento inválido (Sanción clínica)
        telemetry.current.invalidPours += 1;
        setSelectedTube(null);
        return; // UI hará sonido de error
      }

      // EJECUCIÓN DEL MOVIMIENTO:
      // ¿Cuántos bloques del mismo color podemos pasar?
      let contiguousBlocks = 0;
      for (let i = sourceTube.length - 1; i >= 0; i--) {
        if (sourceTube[i] === sourceTopColor) contiguousBlocks++;
        else break;
      }

      const availableSpace = TUBE_CAPACITY - targetTube.length;
      const amountToMove = Math.min(contiguousBlocks, availableSpace);

      // Guardar estado actual en el historial antes de modificar (Para el Undo)
      setHistory((prev) => [...prev, JSON.parse(JSON.stringify(tubes))]);

      // Actualizar tubos
      for (let i = 0; i < amountToMove; i++) {
        targetTube.push(sourceTube.pop()!);
      }

      const newTubes = [...tubes];
      newTubes[selectedTube] = sourceTube;
      newTubes[index] = targetTube;

      // Métricas
      telemetry.current.totalMoves += 1;
      totalTimeAccumulated.current += Date.now() - turnStartTime.current;
      turnStartTime.current = Date.now();

      setTubes(newTubes);
      setSelectedTube(null);

      // Condición de Victoria del Nivel:
      // Un nivel se supera si todos los tubos están vacíos o llenos con el mismo color
      const isLevelComplete = newTubes.every(
        (tube) =>
          tube.length === 0 ||
          (tube.length === TUBE_CAPACITY &&
            tube.every((color) => color === tube[0])),
      );

      if (isLevelComplete) {
        telemetry.current.stagesCompleted += 1;
        setScore((s) => s + currentStage * 500);

        setTimeout(() => {
          setCurrentStage((prev) => {
            const next = prev + 1;
            loadLevel(next);
            return next;
          });
        }, 1500);
      }
    },
    [tubes, selectedTube, gameState, currentStage, loadLevel],
  );

  // --- BOTÓN DESHACER (UNDO) ---
  const undoMove = useCallback(() => {
    if (gameState !== "playing" || history.length === 0) return;

    telemetry.current.undosUsed += 1;

    // Recuperar el último estado
    const previousState = history[history.length - 1];
    setTubes(previousState);
    setSelectedTube(null);

    // Eliminar el último estado del historial
    setHistory((prev) => prev.slice(0, -1));
  }, [gameState, history]);

  // --- CRONÓMETRO GLOBAL ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("finished");
      if (telemetry.current.totalMoves > 0) {
        telemetry.current.averageDecisionTimeMs = Math.round(
          totalTimeAccumulated.current / telemetry.current.totalMoves,
        );
      }
      if (onFinish) onFinish(telemetry.current, score);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, onFinish]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(duration);
    setCurrentStage(1);
    telemetry.current = {
      totalMoves: 0,
      invalidPours: 0,
      undosUsed: 0,
      stagesCompleted: 0,
      averageDecisionTimeMs: 0,
    };
    totalTimeAccumulated.current = 0;
    setGameState("playing");
    loadLevel(1);
  };

  return {
    gameState,
    timeLeft,
    score,
    currentStage,
    tubes,
    selectedTube,
    canUndo: history.length > 0,
    actions: { startGame, handleTubeClick, undoMove },
  };
}
