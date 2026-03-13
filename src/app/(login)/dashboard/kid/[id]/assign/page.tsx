// src/app/(login)/dashboard/kid/[id]/assign/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { client } from "@/sanity/lib/client";
import { getAllMissionsQuery } from "@/lib/query";
import { assignDailySession } from "@/app/actions/mission.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Check, Loader2, Puzzle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AssignMissionsPage({}) {
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const params: { id: string } = useParams();
  const { id } = params;

  useEffect(() => {
    client
      .withConfig({ useCdn: false })
      .fetch(getAllMissionsQuery, {}, { cache: "no-store" })
      .then(setMissions)
      .catch(console.error);
  }, []);

  const toggleMission = (missionId: string) => {
    setSelectedMissions((prev) =>
      prev.includes(missionId)
        ? prev.filter((id) => id !== missionId)
        : [...prev, missionId],
    );
  };

  const handleAssign = () => {
    setError(null);
    startTransition(async () => {
      const result = await assignDailySession(id, selectedMissions);
      console.log("result", result);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href={`/dashboard/kid/${id}`}
        className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Reporte
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Puzzle className="text-cyan-500" /> Asignar Plan de Entrenamiento
        </h1>
        <p className="text-slate-500 mt-2">
          Selecciona las misiones terapéuticas que el cadete deberá completar
          hoy.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-200">
          {error}
        </div>
      )}

      {missions.length === 0 ? (
        <div className="flex justify-center p-12 text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {missions.map((mission) => {
            const isSelected = selectedMissions.includes(mission._id);
            return (
              <Card
                key={mission._id}
                className={`cursor-pointer transition-all border-2 ${isSelected ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:border-cyan-300"}`}
                onClick={() => toggleMission(mission._id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-cyan-500 bg-cyan-500" : "border-slate-300"}`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {mission.title}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase mt-1">
                      {mission.gameType.replace("_", " ")} • Dificultad:{" "}
                      {mission.difficulty}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Button
        onClick={handleAssign}
        disabled={isPending || selectedMissions.length === 0}
        className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold transition-transform active:scale-[0.98]"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Despachando
            Misiones...
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-5 w-5" /> Enviar {selectedMissions.length}{" "}
            Misiones al Cuartel
          </>
        )}
      </Button>
    </div>
  );
}
