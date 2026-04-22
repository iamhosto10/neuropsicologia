// src/lib/telemetry-engine.ts

export function parseTelemetryHistory(sessionsHistory: any[]) {
  if (!sessionsHistory || sessionsHistory.length === 0) return [];

  const allEvents: any[] = [];

  sessionsHistory.forEach((session) => {
    if (session.telemetryData && session.telemetryData.length > 0) {
      session.telemetryData.forEach((jsonString: string) => {
        try {
          const data = JSON.parse(jsonString);

          // Formateamos la fecha para que sea amigable ("DD/MM")
          const dateParts = session.date.split("-");
          const safeDate =
            dateParts.length === 3
              ? `${dateParts[2]}/${dateParts[1]}`
              : session.date;

          // 🔥 EL CEREBRO MATEMÁTICO: Calculamos la precisión (0-100) según el tipo de juego
          let calculatedAccuracy = 0;
          const metrics = data.metrics || {};

          // --- LÓGICA DE DETECCIÓN DE JUEGOS ---

          if (metrics.accuracyRate !== undefined) {
            // 🔥 NUEVO: Juegos con Tasa de Precisión pre-calculada (Ej: Propulsores Warp / Suma Continua)
            calculatedAccuracy = metrics.accuracyRate;
          } else if (
            metrics.successfulDocks !== undefined &&
            metrics.totalAttempts !== undefined
          ) {
            // 🔥 NUEVO: Lógica para Star Docking
            calculatedAccuracy =
              metrics.totalAttempts > 0
                ? (metrics.successfulDocks / metrics.totalAttempts) * 100
                : 0;
          } else if (
            metrics.stagesCompleted !== undefined &&
            metrics.invalidMoves !== undefined
          ) {
            // 🔥 NUEVO: Lógica de Hull Disassembly (Eficiencia de Planificación)
            // Calculamos la precisión basándonos en la ausencia de movimientos inválidos
            const totalValidMoves = metrics.totalMoves - metrics.invalidMoves;
            calculatedAccuracy =
              metrics.totalMoves > 0
                ? Math.max(0, (totalValidMoves / metrics.totalMoves) * 100)
                : 0;
          } else if (
            metrics.invalidPours !== undefined &&
            metrics.undosUsed !== undefined
          ) {
            // 🔥 NUEVO: Lógica de Water Sort (Eficiencia Clínica)
            // Calculamos precisión penalizando errores por impulsividad (invalidPours).
            // Usar 'undo' es bueno clínicamente, así que no lo penalizamos tan fuerte en la gráfica.
            const totalValidPours = metrics.totalMoves - metrics.invalidPours;
            calculatedAccuracy =
              metrics.totalMoves > 0
                ? Math.max(0, (totalValidPours / metrics.totalMoves) * 100)
                : 0;
          } else if (
            metrics.correctClicks !== undefined &&
            metrics.incorrectClicks !== undefined
          ) {
            // Juegos basados en clics (Ej: Space Cleanup)
            const totalClicks = metrics.correctClicks + metrics.incorrectClicks;
            calculatedAccuracy =
              totalClicks > 0 ? (metrics.correctClicks / totalClicks) * 100 : 0;
          } else if (metrics.success !== undefined) {
            // Juegos basados en acierto/fallo (Ej: Go/No-Go o Reverse Communicator)
            calculatedAccuracy = metrics.success === true ? 100 : 0;
          } else if (metrics.efficiencyScore !== undefined) {
            // Juegos de Planificación (Ej: Ruta de Navegación)
            calculatedAccuracy = metrics.efficiencyScore;
          }

          allEvents.push({ ...data, date: safeDate, calculatedAccuracy });
        } catch (e) {
          console.error("Error parseando telemetría:", e);
        }
      });
    }
  });

  return allEvents;
}

export function generateAccuracyChartData(events: any[]) {
  // 1. Agrupamos por fecha y sacamos el promedio de accuracy calculado
  const groupedByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = { date: event.date, totalAccuracy: 0, count: 0 };
    }
    acc[event.date].totalAccuracy += event.calculatedAccuracy || 0;
    acc[event.date].count += 1;
    return acc;
  }, {});

  // 2. Formateamos para Recharts y usamos .reverse() para que las fechas
  // más antiguas queden a la izquierda y las más recientes a la derecha.
  return Object.values(groupedByDate)
    .map((day: any) => ({
      name: day.date,
      precision: Math.round(day.totalAccuracy / day.count),
    }))
    .reverse();
}

// Esta interfaz asume que en el Paso 3 le pasaremos el historial de sesiones y
// un mapeo de las misiones para saber qué ID corresponde a qué juego.
export interface ProcessedGameSession {
  date: string; // Fecha de la sesión
  missionId: string; // ID de la misión jugada
  metrics: any; // El JSON crudo de la telemetría de ese día
}

/**
 * Filtra el historial general de sesiones del niño y extrae ÚNICAMENTE
 * la telemetría que corresponde a un `gameType` específico (Ej: "asteroids_go_nogo").
 * Lo ordena desde el más reciente al más antiguo.
 */
export function extractGameTelemetryByDate(
  sessionsHistory: any[],
  targetGameType: string,
  missionsMap: Record<string, string>, // Mapeo: { "missionId_123": "asteroids_go_nogo" }
): ProcessedGameSession[] {
  if (!sessionsHistory || sessionsHistory.length === 0) return [];

  const extractedData: ProcessedGameSession[] = [];

  // Recorremos cada día de sesión
  sessionsHistory.forEach((session) => {
    if (!session.telemetryData || session.telemetryData.length === 0) return;

    // Recorremos la telemetría guardada en ese día
    session.telemetryData.forEach((telemetryString: string) => {
      try {
        const parsedData = JSON.parse(telemetryString);
        const missionId = parsedData.missionId;

        // Verificamos si esta misión es del tipo de juego que estamos buscando
        const gameTypeOfThisMission = missionsMap[missionId];

        if (gameTypeOfThisMission === targetGameType) {
          extractedData.push({
            date: session.date,
            missionId: missionId,
            metrics: parsedData.metrics, // Aquí vienen los milisegundos y errores
          });
        }
      } catch (error) {
        console.error(
          "Error parseando telemetría clínica en la fecha",
          session.date,
          error,
        );
      }
    });
  });

  // Ordenamos cronológicamente: Las más recientes primero
  return extractedData.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
