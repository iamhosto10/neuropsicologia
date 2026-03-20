// src/components/dashboard/mission-assigner.tsx
"use client";

import { useState, useTransition } from "react";
import { assignDailySession } from "@/app/actions/mission.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Rocket } from "lucide-react";

export default function MissionAssigner({
  kidId,
  missions,
}: {
  kidId: string;
  missions: any[];
}) {
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
      // Llamamos a tu función recién mejorada
      const result = await assignDailySession(kidId, selectedMissions);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-200">
          {error}
        </div>
      )}

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
                  <h3 className="font-bold text-slate-800">{mission.title}</h3>
                  <p className="text-xs text-slate-500 uppercase mt-1">
                    {mission.gameType?.replace("_", " ") || "Juego"} •
                    Dificultad: {mission.difficulty || "Normal"}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
    </>
  );
}
