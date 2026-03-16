// src/components/dashboard/dashboard-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAvatarIcon } from "@/lib/utils";

export default function DashboardOverview({ kids }: { kids: any[] }) {
  if (!kids || kids.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm mt-8">
        <h3 className="text-2xl font-black text-slate-800 mb-2">
          Sin cadetes asignados
        </h3>
        <p className="text-slate-500">
          Comienza añadiendo a tu primer paciente o hijo para monitorear su
          progreso.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {kids.map((kid, i) => {
        // Lógica de progreso del día
        const totalMisiones = kid.todaySession?.totalMissions || 0;
        const completadas = kid.todaySession?.completedMissions || 0;
        const progreso =
          totalMisiones === 0
            ? 0
            : Math.round((completadas / totalMisiones) * 100);
        const isDone = kid.todaySession?.isCompleted;

        return (
          <Card
            key={kid._id}
            className="rounded-[2rem] border-slate-200 shadow-sm hover:shadow-lg transition-all animate-in fade-in zoom-in-95"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-slate-200">
                  {getAvatarIcon(kid.activeAvatar)}
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-slate-800">
                    {kid.alias}
                  </CardTitle>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                    {kid.energyCrystals} Cristales
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">Misiones de hoy</span>
                  <span className={isDone ? "text-green-500" : "text-cyan-600"}>
                    {completadas} / {totalMisiones}
                  </span>
                </div>
                <Progress
                  value={progreso}
                  className="h-3 bg-slate-100"
                  indicatorClassName={isDone ? "bg-green-500" : "bg-cyan-500"}
                />

                {/* Indicador de estado */}
                {totalMisiones === 0 ? (
                  <p className="text-xs text-amber-600 flex items-center gap-1 font-medium bg-amber-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" /> Sin rutina para hoy
                  </p>
                ) : isDone ? (
                  <p className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 p-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4" /> Entrenamiento completado
                  </p>
                ) : (
                  <p className="text-xs text-cyan-600 flex items-center gap-1 font-medium bg-cyan-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" /> Entrenamiento pendiente
                  </p>
                )}
              </div>
              <Link href={`/dashboard/kid/${kid._id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-bold border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50 h-12"
                >
                  Ver Perfil Clínico <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
