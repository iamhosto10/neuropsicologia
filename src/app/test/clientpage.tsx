"use client";
import React, { useState } from "react";
import InlineGameWrapper from "@/components/lesson-detail/inline-game-wrapper";

const games = [
  {
    title: "Limpieza Espacial (Atención Selectiva)",
    gameType: "cleanup",
  },
  {
    title: "Centinela Satélite (Atención Sostenida)",
    gameType: "satellite",
  },
  {
    title: "Campo de Asteroides (Control Inhibitorio)",
    gameType: "asteroid",
  },
  {
    title: "Comunicador Inverso (Flexibilidad)",
    gameType: "reverse",
  },
  {
    title: "Panel de Seguridad (Memoria Visoespacial)",
    gameType: "memori",
  },
  {
    title: "Gran Evasión (Multitarea y Atención Dividida)",
    gameType: "multitask",
  },
  {
    title: "Laboratorio de Carga (Memoria N-Back)",
    gameType: "cargo_n_back",
  },
  {
    title: "Tormenta de Nebulosa (Control de Interferencia)",
    gameType: "nebula_storm",
  },
  {
    title: "Decodificador de Señales (Velocidad Procesamiento)",
    gameType: "signal_decoder",
  },
  {
    title: "Ruta de Navegación (Planificación Ejecutiva)",
    gameType: "navigation",
  },
  { title: "Propulsores Warp (Suma Continua)", gameType: "warp_drive" },
];

const ClientPage = () => {
  // estado: { cleanup: "easy", satellite: "medium", ... }
  const [difficulties, setDifficulties] = useState(
    Object.fromEntries(games.map((g) => [g.gameType, "easy"])),
  );

  const handleChange = (gameType: string, value: string) => {
    setDifficulties((prev) => ({
      ...prev,
      [gameType]: value,
    }));
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-10">
      {games.map((game) => (
        <div key={game.gameType} className="space-y-3">
          <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
            {game.title}
          </h2>

          {/* Select de dificultad */}
          <select
            value={difficulties[game.gameType]}
            onChange={(e) => handleChange(game.gameType, e.target.value)}
            className="border rounded-md px-3 py-2 bg-white text-black"
          >
            <option value="easy">Fácil</option>
            <option value="medium">Medio</option>
            <option value="hard">Difícil</option>
          </select>

          {/* Juego */}
          <InlineGameWrapper
            value={{
              gameType: game.gameType,
              difficulty: difficulties[game.gameType],
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ClientPage;
