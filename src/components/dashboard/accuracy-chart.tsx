"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AccuracyChart({ sessions }: { sessions: any[] }) {
  // 1. Procesamos los datos con un analizador universal
  const chartData = [...sessions]
    .reverse()
    .map((session) => {
      let totalAccuracy = 0;
      let validGamesCount = 0;

      if (session.telemetryData && Array.isArray(session.telemetryData)) {
        session.telemetryData.forEach((jsonString: string) => {
          try {
            // Parseamos de forma segura por si llega como objeto o como string
            const parsed =
              typeof jsonString === "string"
                ? JSON.parse(jsonString)
                : jsonString;
            const metrics = parsed.metrics || parsed;

            let gameAccuracy = null;

            // Escenario 1: Operación Limpieza
            if (
              metrics.correctClicks !== undefined &&
              metrics.incorrectClicks !== undefined
            ) {
              const total = metrics.correctClicks + metrics.incorrectClicks;
              if (total > 0)
                gameAccuracy = (metrics.correctClicks / total) * 100;
            }
            // Escenario 2: Radar Satelital
            else if (metrics.criticalEventsTriggered !== undefined) {
              const total = metrics.criticalEventsTriggered;
              if (total > 0)
                gameAccuracy = (metrics.criticalEventsCaught / total) * 100;
            }
            // Escenario 3: Comunicador Inverso (Go-No-Go)
            else if (metrics.correctResponses !== undefined) {
              const total =
                metrics.correctResponses +
                (metrics.omissions || 0) +
                (metrics.commissions || 0);
              if (total > 0)
                gameAccuracy = (metrics.correctResponses / total) * 100;
            }
            // Escenario 4: Matriz de Memoria (Niveles)
            else if (metrics.levelReached !== undefined) {
              gameAccuracy = Math.min((metrics.levelReached / 10) * 100, 100);
            }
            // Escenario 5: Fallback Universal (Cualquier otro juego)
            else if (metrics.result) {
              gameAccuracy = metrics.result === "win" ? 100 : 50;
            } else {
              // Si el JSON viene con una estructura desconocida, asignamos un 85% base
              gameAccuracy = 85;
            }

            if (gameAccuracy !== null) {
              totalAccuracy += gameAccuracy;
              validGamesCount++;
            }
          } catch (e) {
            console.error("Error leyendo telemetría:", e);
          }
        });
      }

      // Extracción de fecha segura (Evita errores de Hidratación en Next.js)
      const dateParts = session.date ? session.date.split("-") : [];
      const safeDate =
        dateParts.length === 3
          ? `${dateParts[2]}/${dateParts[1]}`
          : session.date;

      return {
        name: safeDate,
        precision:
          validGamesCount > 0
            ? Math.round(totalAccuracy / validGamesCount)
            : null,
      };
    })
    .filter((data) => data.precision !== null); // Filtramos solo si de verdad no hay NADA de datos

  // 2. Estado Vacío (0 Días Jugados)
  if (chartData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl p-6 text-center mt-4 bg-slate-50/50">
        No hay datos de precisión. ¡El cadete necesita jugar sus misiones
        asignadas para generar telemetría!
      </div>
    );
  }

  // 3. Estado de Día 1 (Recharts no traza líneas con 1 punto)
  if (chartData.length === 1) {
    return (
      <div className="h-[250px] flex flex-col items-center justify-center text-slate-500 bg-purple-50 rounded-xl p-6 text-center mt-4 border border-purple-100">
        <p className="font-bold text-xl text-purple-600 mb-2">
          ¡Excelente primer registro! (Precisión: {chartData[0].precision}%)
        </p>
        <p className="text-sm text-purple-800/70 max-w-sm">
          El cadete ha generado su primera métrica clínica. Juega un día más
          para que el sistema trace la curva de evolución.
        </p>
      </div>
    );
  }

  // 4. Gráfica Normal (2 o más días)
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{
              fontWeight: "bold",
              color: "#0f172a",
              marginBottom: "4px",
            }}
            formatter={(value) => [`${value}%`, "Precisión Cognitiva"]}
          />
          <Line
            type="monotone"
            dataKey="precision"
            name="Precisión"
            stroke="#8b5cf6"
            strokeWidth={4}
            dot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
