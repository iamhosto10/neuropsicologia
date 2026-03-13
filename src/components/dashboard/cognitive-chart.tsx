// src/components/dashboard/cognitive-chart.tsx
"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function CognitiveChart({ sessions }: { sessions: any[] }) {
  const chartData = [...sessions].reverse().map((session) => {
    // Extracción de fecha segura (Anti-Hidratación)
    const dateParts = session.date ? session.date.split("-") : [];
    const safeDate =
      dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : session.date;

    return {
      name: safeDate,
      completadas: session.completedCount || 0,
      asignadas: session.assignedCount || 0,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl p-6 text-center mt-4">
        Aún no hay suficientes datos para generar la gráfica.
      </div>
    );
  }

  // Protección para el Día 1
  if (chartData.length === 1) {
    return (
      <div className="h-[250px] flex flex-col items-center justify-center text-slate-500 bg-cyan-50 rounded-xl p-6 text-center mt-4 border border-cyan-100">
        <p className="font-bold text-xl text-cyan-600 mb-2">
          ¡Primer día de entrenamiento!
        </p>
        <p className="text-sm text-cyan-800/70 max-w-sm">
          Asigna y juega misiones el día de mañana para poder visualizar tu
          curva de constancia.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          />
          <Area
            type="monotone"
            dataKey="completadas"
            name="Misiones Logradas"
            stroke="#06b6d4"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCompletadas)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
