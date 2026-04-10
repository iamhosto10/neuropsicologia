"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { assignDailySession } from "@/app/actions/mission.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Rocket,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Battery,
  Search,
  ChevronDown,
  Brain,
  Focus,
  Dna,
  Cpu,
  Gamepad2,
} from "lucide-react";

// Helper para asignar un icono según el dominio clínico
const getDomainIcon = (domain: string) => {
  const d = domain.toLowerCase();
  if (d.includes("atención"))
    return <Focus className="w-5 h-5 text-amber-500" />;
  if (d.includes("memoria")) return <Dna className="w-5 h-5 text-purple-500" />;
  if (d.includes("procesamiento") || d.includes("ejecutiva"))
    return <Cpu className="w-5 h-5 text-blue-500" />;
  return <Brain className="w-5 h-5 text-cyan-500" />;
};

export default function MissionAssigner({
  kidId,
  availableGames,
}: {
  kidId: string;
  availableGames: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Estados del Formulario
  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [configuredMissions, setConfiguredMissions] = useState<any[]>([]);

  // Estados del Desplegable Rico
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedGameType, setSelectedGameType] = useState<string>("");
  const [tempConfig, setTempConfig] = useState({
    difficulty: "medium",
    timeLimit: 60,
    energyReward: 50, // 🔥 Este es el valor por defecto que ahora controlaremos
  });

  // Cierra el menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGames = availableGames.filter(
    (game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.domain.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedGameInfo = availableGames.find(
    (g) => g.gameType === selectedGameType,
  );

  const handleSelectGame = (gameType: string) => {
    setSelectedGameType(gameType);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleAddMission = () => {
    if (!selectedGameType) return;
    if (configuredMissions.length >= 5) {
      setError("Un cadete no debe tener más de 5 misiones al día.");
      return;
    }

    const newMission = {
      gameType: selectedGameType,
      title: selectedGameInfo?.title || "Misión Terapéutica",
      difficulty: tempConfig.difficulty,
      timeLimit: tempConfig.timeLimit,
      energyReward: tempConfig.energyReward, // 🔥 Guardamos el valor elegido por el terapeuta
    };

    setConfiguredMissions([...configuredMissions, newMission]);
    setError(null);
    setSelectedGameType("");
  };

  const handleRemoveMission = (indexToRemove: number) => {
    setConfiguredMissions(
      configuredMissions.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleAssign = () => {
    if (configuredMissions.length === 0) {
      setError("Debes configurar al menos una misión antes de enviar.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await assignDailySession(
        kidId,
        selectedDate,
        configuredMissions,
      );
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200">
          {error}
        </div>
      )}

      {/* SECCIÓN 1: FECHA */}
      <Card className="rounded-2xl shadow-sm border-slate-200 overflow-visible z-10 relative">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" /> Fecha de la
            Sesión
          </h3>
        </div>
        <CardContent className="p-6">
          <input
            type="date"
            value={selectedDate}
            min={todayDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-1/2 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium bg-white"
          />
        </CardContent>
      </Card>

      {/* SECCIÓN 2: CONSTRUCTOR DE LA RECETA */}
      <Card className="rounded-2xl shadow-sm border-slate-200 overflow-visible z-50 relative">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-500" /> Añadir Juego al
            Entrenamiento
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            {/* DESPLEGABLE RICO */}
            <div className="flex-1 relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Seleccionar Juego Clínico
              </label>

              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full p-4 border rounded-xl bg-white flex items-center justify-between cursor-pointer transition-all ${
                  isDropdownOpen
                    ? "border-cyan-500 ring-2 ring-cyan-100"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                {selectedGameType ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      {getDomainIcon(selectedGameInfo.domain)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 leading-tight">
                        {selectedGameInfo.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-cyan-600">
                        {selectedGameInfo.domain}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" /> Elige un juego del
                    catálogo...
                  </span>
                )}
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {/* 🔥 MENÚ FLOTANTE (Ahora se abre hacia ARRIBA y es más alto) 🔥 */}
              {isDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o dominio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      autoFocus
                    />
                  </div>

                  {/* 🔥 AUMENTAMOS max-h a 400px 🔥 */}
                  <div className="max-h-100 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {filteredGames.length > 0 ? (
                      filteredGames.map((game) => (
                        <div
                          key={game.gameType}
                          onClick={() => handleSelectGame(game.gameType)}
                          className="flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-colors hover:bg-slate-50 group border border-transparent hover:border-slate-100"
                        >
                          <div className="mt-1 p-2 rounded-lg bg-white border border-slate-100 shadow-sm group-hover:shadow transition-shadow">
                            {getDomainIcon(game.domain)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                              {game.title}
                            </h4>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 mb-1">
                              {game.domain}
                            </span>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                              {game.description ||
                                "Juego de entrenamiento cognitivo."}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No se encontraron juegos con ese nombre.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Configuración rápida */}
            {selectedGameType && (
              <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-300">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">
                    Dificultad Inicial
                  </label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-lg bg-white outline-none font-medium text-sm focus:ring-2 focus:ring-cyan-500"
                    value={tempConfig.difficulty}
                    onChange={(e) =>
                      setTempConfig({
                        ...tempConfig,
                        difficulty: e.target.value,
                      })
                    }
                  >
                    <option value="easy">Modo Fácil (Mayor tiempo)</option>
                    <option value="medium">Modo Medio (Estándar)</option>
                    <option value="hard">Modo Difícil (Reacción rápida)</option>
                  </select>
                </div>

                <div className="w-full md:w-28">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duración
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      className="w-full p-3 border border-slate-200 rounded-lg bg-white outline-none font-bold text-sm focus:ring-2 focus:ring-cyan-500 pr-8"
                      value={tempConfig.timeLimit}
                      onChange={(e) =>
                        setTempConfig({
                          ...tempConfig,
                          timeLimit: parseInt(e.target.value) || 60,
                        })
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      s
                    </span>
                  </div>
                </div>

                {/* 🔥 NUEVO CAMPO: CRISTALES (ENERGY REWARD) 🔥 */}
                <div className="w-full md:w-28">
                  <label className="text-[10px] font-black text-yellow-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Battery className="w-3 h-3" /> Cristales
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      className="w-full p-3 border border-yellow-200 rounded-lg bg-yellow-50 outline-none font-bold text-sm focus:ring-2 focus:ring-yellow-500 text-yellow-700 pr-8"
                      value={tempConfig.energyReward}
                      onChange={(e) =>
                        setTempConfig({
                          ...tempConfig,
                          energyReward: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 text-xs font-bold">
                      💎
                    </span>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAddMission}
                    className="h-11.5 w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 font-bold shadow-md gap-2"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 3: LA "RECETA" DE MISIONES */}
      {configuredMissions.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in">
          <h3 className="text-lg font-black text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-md">
              {configuredMissions.length}/5
            </span>
            Juegos Listos para Asignar
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {configuredMissions.map((mission, index) => (
              <div
                key={index}
                className="bg-white border-l-4 border-l-cyan-500 border border-y-slate-200 border-r-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-shadow"
              >
                <div>
                  <h4 className="font-bold text-slate-800">{mission.title}</h4>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                      {mission.difficulty === "easy"
                        ? "Fácil"
                        : mission.difficulty === "hard"
                          ? "Difícil"
                          : "Media"}
                    </span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {mission.timeLimit}s
                    </span>
                    <span className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-md flex items-center gap-1">
                      <Battery className="w-3 h-3" /> +{mission.energyReward}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMission(index)}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTÓN FINAL DE ENVÍO */}
      <Button
        onClick={handleAssign}
        disabled={isPending || configuredMissions.length === 0}
        className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold transition-transform active:scale-[0.98] shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none mt-8"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Procesando
            Protocolo Clínico...
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-6 w-6" /> Agendar y Enviar al Cadete
          </>
        )}
      </Button>
    </div>
  );
}
