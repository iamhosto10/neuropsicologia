// src/components/dashboard/accuracy-chart.tsx
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

export default function AccuracyChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-75 flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl p-6 text-center mt-4">
        Aún no hay suficientes datos de precisión para generar la gráfica.
      </div>
    );
  }

  // Protección visual: Si solo hay un día de datos, la línea no se puede dibujar bien.
  // Recharts necesita al menos 2 puntos para hacer una línea.
  if (data.length === 1) {
    return (
      <div className="h-62.5 flex flex-col items-center justify-center text-slate-500 bg-purple-50 rounded-xl p-6 text-center mt-4 border border-purple-100">
        <p className="font-bold text-xl text-purple-600 mb-2">
          Primera evaluación registrada: {data[0].precision}%
        </p>
        <p className="text-sm text-purple-800/70 max-w-sm">
          Completa misiones en otro día diferente para poder trazar la curva de
          evolución clínica.
        </p>
      </div>
    );
  }

  return (
    <div className="h-75 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: -20, bottom: 10 }}
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
            domain={[0, 100]} // Mantenemos la escala estricta de 0 a 100
          />
          <Tooltip
            cursor={{
              stroke: "#cbd5e1",
              strokeWidth: 2,
              strokeDasharray: "3 3",
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: any) => [`${value}%`, "Precisión Promedio"]}
          />
          {/* 🔥 Cambiamos el Bar por un Line con puntos marcados */}
          <Line
            type="monotone"
            dataKey="precision"
            name="Precisión"
            stroke="#9333ea" // Púrpura clínico
            strokeWidth={4}
            dot={{ r: 6, fill: "#9333ea", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{
              r: 8,
              fill: "#9333ea",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
