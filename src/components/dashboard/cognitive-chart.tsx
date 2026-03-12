// src/components/dashboard/cognitive-chart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function CognitiveChart({ sessions }: { sessions: any[] }) {
  // Transformamos los datos de Sanity para el gráfico
  // Invertimos el array para que el gráfico vaya del día más antiguo al más reciente
  const chartData = [...sessions].reverse().map((session) => ({
    name: new Date(session.date).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
    }),
    completadas: session.completedCount || 0,
    asignadas: session.assignedCount || 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-75 flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">
        Aún no hay suficientes datos para generar la gráfica.
      </div>
    );
  }

  return (
    <div className="h-75 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            x
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
