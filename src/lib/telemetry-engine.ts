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

          if (
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
