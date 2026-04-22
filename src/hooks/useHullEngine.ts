import { useState, useRef, useCallback, useEffect } from "react";

export type Hole = { id: number; hasBolt: boolean };
export type Plate = {
  id: string;
  coveredHoles: number[];
  color: string;
  zIndex: number;
  isFallen: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
};

interface HullConfig {
  duration?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface HullTelemetry {
  totalMoves: number;
  stagesCompleted: number;
  invalidMoves: number;
  averageTimePerMoveMs: number;
}

// Función auxiliar para dibujar placas
function createPlate(
  id: string,
  holes: number[],
  zIndex: number,
  color: string,
  colCount: number,
): Plate {
  const isHorizontal = holes[1] - holes[0] === 1;
  const cellSize = 100 / colCount;
  const firstCol = holes[0] % colCount;
  const firstRow = Math.floor(holes[0] / colCount);

  return {
    id,
    coveredHoles: holes,
    color,
    zIndex,
    isFallen: false,
    x: firstCol * cellSize,
    y: firstRow * cellSize,
    w: isHorizontal ? holes.length * cellSize : cellSize,
    h: isHorizontal ? cellSize : holes.length * cellSize,
  };
}

export function useHullEngine(
  config: HullConfig,
  onFinish?: (telemetry: HullTelemetry, finalScore: number) => void,
) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [currentStage, setCurrentStage] = useState(1);

  const [colCount, setColCount] = useState(4);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [selectedHole, setSelectedHole] = useState<number | null>(null);

  const telemetry = useRef<HullTelemetry>({
    totalMoves: 0,
    stagesCompleted: 0,
    invalidMoves: 0,
    averageTimePerMoveMs: 0,
  });
  const turnStartTime = useRef<number>(0);
  const totalTimeAccumulated = useRef<number>(0);

  // --- EL BANCO DE PLANTILLAS ALEATORIAS (Templates) ---
  const loadLevel = useCallback(
    (stage: number) => {
      let complexity = 1;
      if (difficulty === "easy") complexity = stage === 1 ? 1 : 2;
      else if (difficulty === "medium")
        complexity =
          stage === 1 ? 2 : stage === 2 ? 3 : Math.floor(Math.random() * 2) + 3;
      else if (difficulty === "hard") complexity = stage === 1 ? 4 : 5;

      let newColCount = 4;
      let initialPlates: Plate[] = [];
      let emptyHoles: number[] = [];

      // Elegir una variación al azar para crear el efecto "Random"
      const variation = Math.random() > 0.5 ? "A" : "B";

      if (complexity === 1) {
        newColCount = 4;
        if (variation === "A") {
          initialPlates = [
            createPlate("p1", [4, 5, 6], 10, "bg-cyan-700", 4),
            createPlate("p2", [2, 6, 10], 20, "bg-blue-600", 4),
          ];
          emptyHoles = [0, 1, 3, 7, 8, 9, 11, 12, 13, 14, 15];
        } else {
          initialPlates = [
            createPlate("p1", [8, 9, 10], 10, "bg-teal-700", 4),
            createPlate("p2", [1, 5, 9], 20, "bg-indigo-600", 4),
          ];
          emptyHoles = [0, 2, 3, 4, 6, 7, 11, 12, 13, 14, 15];
        }
      } else if (complexity === 2) {
        newColCount = 4;
        if (variation === "A") {
          initialPlates = [
            createPlate("p1", [0, 4, 8], 10, "bg-indigo-600", 4),
            createPlate("p2", [8, 9, 10], 20, "bg-blue-600", 4),
            createPlate("p3", [2, 6, 10], 30, "bg-cyan-500", 4),
          ];
          emptyHoles = [1, 3, 12, 13, 14, 15];
        } else {
          initialPlates = [
            createPlate("p1", [1, 2, 3], 10, "bg-rose-600", 4),
            createPlate("p2", [1, 5, 9], 20, "bg-orange-600", 4),
            createPlate("p3", [5, 6, 7], 30, "bg-amber-500", 4),
          ];
          emptyHoles = [0, 4, 8, 10, 11, 12, 13, 14, 15];
        }
      } else if (complexity === 3) {
        newColCount = 4;
        if (variation === "A") {
          initialPlates = [
            createPlate("p1", [1, 2, 3], 10, "bg-slate-600", 4),
            createPlate("p2", [1, 5, 9], 20, "bg-cyan-700", 4),
            createPlate("p3", [9, 10, 11], 30, "bg-blue-600", 4),
            createPlate("p4", [7, 11, 15], 40, "bg-indigo-600", 4),
          ];
          emptyHoles = [0, 4, 8, 12, 13, 14];
        } else {
          initialPlates = [
            createPlate("p1", [4, 5, 6], 10, "bg-purple-600", 4),
            createPlate("p2", [6, 10, 14], 20, "bg-fuchsia-700", 4),
            createPlate("p3", [12, 13, 14], 30, "bg-pink-600", 4),
            createPlate("p4", [0, 4, 8], 40, "bg-rose-600", 4),
          ];
          emptyHoles = [1, 2, 3, 7, 9, 11, 15];
        }
      } else if (complexity === 4) {
        newColCount = 5;
        if (variation === "A") {
          initialPlates = [
            createPlate("p1", [6, 7, 8], 10, "bg-purple-600", 5),
            createPlate("p2", [8, 13, 18], 20, "bg-fuchsia-600", 5),
            createPlate("p3", [16, 17, 18], 30, "bg-rose-600", 5),
            createPlate("p4", [11, 16, 21], 40, "bg-orange-600", 5),
            createPlate("p5", [11, 12, 13], 50, "bg-amber-600", 5),
          ];
          emptyHoles = [0, 1, 4, 5, 9, 20, 24, 22];
        } else {
          initialPlates = [
            createPlate("p1", [2, 7, 12], 10, "bg-teal-600", 5),
            createPlate("p2", [12, 13, 14], 20, "bg-emerald-600", 5),
            createPlate("p3", [4, 9, 14], 30, "bg-cyan-600", 5),
            createPlate("p4", [20, 21, 22], 40, "bg-blue-600", 5),
            createPlate("p5", [10, 15, 20], 50, "bg-indigo-600", 5),
          ];
          emptyHoles = [0, 1, 3, 5, 6, 8, 16, 17, 18, 19, 23, 24];
        }
      } else {
        newColCount = 5;
        if (variation === "A") {
          initialPlates = [
            createPlate("p1", [1, 6, 11], 10, "bg-red-700", 5),
            createPlate("p2", [11, 12, 13], 20, "bg-orange-600", 5),
            createPlate("p3", [13, 18, 23], 30, "bg-yellow-600", 5),
            createPlate("p4", [21, 22, 23], 40, "bg-green-600", 5),
            createPlate("p5", [7, 12, 17], 50, "bg-teal-600", 5),
            createPlate("p6", [7, 8, 9], 60, "bg-cyan-600", 5),
          ];
          emptyHoles = [0, 2, 3, 4, 10, 14, 20, 24];
        } else {
          initialPlates = [
            createPlate("p1", [5, 6, 7], 10, "bg-slate-700", 5),
            createPlate("p2", [7, 12, 17], 20, "bg-slate-600", 5),
            createPlate("p3", [17, 18, 19], 30, "bg-slate-500", 5),
            createPlate("p4", [9, 14, 19], 40, "bg-slate-400", 5),
            createPlate("p5", [1, 6, 11], 50, "bg-slate-300", 5),
            createPlate("p6", [1, 2, 3], 60, "bg-slate-200", 5),
          ];
          emptyHoles = [0, 4, 8, 10, 15, 20, 21, 22, 23, 24];
        }
      }

      const totalHoles = newColCount * newColCount;
      const initialHoles: Hole[] = Array.from(
        { length: totalHoles },
        (_, i) => ({
          id: i,
          hasBolt: !emptyHoles.includes(i),
        }),
      );

      setColCount(newColCount);
      setHoles(initialHoles);
      setPlates(initialPlates);
      setSelectedHole(null);
      turnStartTime.current = Date.now();
    },
    [difficulty],
  );

  // --- MOTOR GRAVITACIONAL ---
  const evaluateGravity = useCallback(
    (currentHoles: Hole[], currentPlates: Plate[]) => {
      let platesChanged = false;
      let newPlates = [...currentPlates];

      for (let cascade = 0; cascade < 3; cascade++) {
        let madeChangeThisLoop = false;
        newPlates = newPlates.map((plate) => {
          if (plate.isFallen) return plate;

          const isPinned = plate.coveredHoles.some(
            (holeId) => currentHoles[holeId].hasBolt,
          );
          const isBlocked = newPlates.some(
            (otherPlate) =>
              !otherPlate.isFallen &&
              otherPlate.zIndex > plate.zIndex &&
              otherPlate.coveredHoles.some((h) =>
                plate.coveredHoles.includes(h),
              ),
          );

          if (!isPinned && !isBlocked) {
            madeChangeThisLoop = true;
            platesChanged = true;
            return { ...plate, isFallen: true };
          }
          return plate;
        });
        if (!madeChangeThisLoop) break;
      }

      return { platesChanged, newPlates };
    },
    [],
  );

  // --- INPUT DEL USUARIO ---
  const handleHoleClick = useCallback(
    (holeId: number) => {
      if (gameState !== "playing") return;

      const clickedHole = holes.find((h) => h.id === holeId)!;

      if (clickedHole.hasBolt) {
        setSelectedHole(selectedHole === holeId ? null : holeId);
        return;
      }

      if (!clickedHole.hasBolt && selectedHole !== null) {
        const isHoleCoveredByPlate = plates.some(
          (p) => !p.isFallen && p.coveredHoles.includes(holeId),
        );

        if (isHoleCoveredByPlate) {
          telemetry.current.invalidMoves += 1;
          setSelectedHole(null);
          return;
        }

        telemetry.current.totalMoves += 1;
        totalTimeAccumulated.current += Date.now() - turnStartTime.current;
        turnStartTime.current = Date.now();

        const newHoles = holes.map((h) => {
          if (h.id === selectedHole) return { ...h, hasBolt: false };
          if (h.id === holeId) return { ...h, hasBolt: true };
          return h;
        });

        const { platesChanged, newPlates } = evaluateGravity(newHoles, plates);

        setHoles(newHoles);
        setSelectedHole(null);

        if (platesChanged) {
          setPlates(newPlates);
          const fallenCount =
            newPlates.filter((p) => p.isFallen).length -
            plates.filter((p) => p.isFallen).length;
          setScore((s) => s + fallenCount * 250);

          if (newPlates.every((p) => p.isFallen)) {
            telemetry.current.stagesCompleted += 1;
            setScore((s) => s + 1000);

            setTimeout(() => {
              setCurrentStage((prev) => {
                const next = prev + 1;
                loadLevel(next);
                return next;
              });
            }, 1500);
          }
        }
      }
    },
    [holes, plates, selectedHole, gameState, evaluateGravity, loadLevel],
  );

  // --- CRONÓMETRO ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("finished");
      if (telemetry.current.totalMoves > 0) {
        telemetry.current.averageTimePerMoveMs = Math.round(
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
      stagesCompleted: 0,
      invalidMoves: 0,
      averageTimePerMoveMs: 0,
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
    colCount,
    holes,
    plates,
    selectedHole,
    actions: { startGame, handleHoleClick },
  };
}
