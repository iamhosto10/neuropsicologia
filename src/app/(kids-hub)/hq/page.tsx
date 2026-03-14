import { Zap, Shield, Play, ShoppingCart } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { getKidDashboardQuery } from "@/sanity/lib/queries";
import Link from "next/link";
import { getActiveKidId, clearKidProfile } from "@/app/actions/profile.actions";
import { redirect } from "next/navigation";

export default async function HeadquartersPage() {
  const kidId = await getActiveKidId();

  if (!kidId) {
    redirect("/select-profile");
  }

  const today = new Date().toISOString().split("T")[0];

  const dashboardData = await client.fetch(
    getKidDashboardQuery,
    { kidId, todayDate: today },
    { cache: "no-store" },
  );

  if (!dashboardData) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl">Error de comunicación con la base...</h2>
        <p>No pudimos encontrar tu perfil de cadete.</p>
      </div>
    );
  }
  console.log(dashboardData);
  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
      {/* Cabecera dinámica */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600 tracking-tight">
          Cuartel General
        </h1>
        <p className="text-xl text-slate-400 font-medium">
          Hola,{" "}
          <span className="text-white font-bold">{dashboardData.alias}</span>.
          {dashboardData.todaySession?.isCompleted
            ? " ¡Misiones de hoy terminadas!"
            : " Tienes misiones pendientes."}
        </p>
        <Link
          href="/hq/store"
          className="bg-linear-to-r from-yellow-500 to-orange-500 p-6 rounded-3xl border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 transition-transform flex items-center justify-between group"
        >
          <div>
            <h3 className="text-2xl font-black text-slate-950 mb-1">
              Bazar Espacial
            </h3>
            <p className="text-yellow-900 font-medium">
              Usa tus cristales aquí
            </p>
          </div>
          <ShoppingCart className="w-12 h-12 text-slate-950 opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
        </Link>
      </div>
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 flex items-center gap-6 shadow-2xl w-full max-w-md justify-center">
        <div className="w-24 h-24 bg-slate-800 rounded-2xl border-4 border-slate-700 flex items-center justify-center">
          <Shield className="w-12 h-12 text-slate-500" />
        </div>
        <div>
          <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">
            Energía Acumulada
          </p>
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span className="text-4xl font-mono font-bold text-yellow-400">
              {dashboardData.energyCrystals}
            </span>
          </div>
        </div>
      </div>
      <div className="w-full mt-8">
        {!dashboardData.todaySession ? (
          <div className="text-center bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
            <h3 className="text-2xl text-slate-300">
              No hay misiones asignadas para hoy.
            </h3>
            <p className="text-slate-500 mt-2">
              Dile a tu comandante (tus padres) que preparen tu ruta.
            </p>
          </div>
        ) : dashboardData.todaySession.isCompleted ? (
          <div className="text-center bg-green-900/20 p-8 rounded-2xl border border-green-500/30">
            <h3 className="text-3xl text-green-400 font-bold">
              ¡Día Superado!
            </h3>
            <p className="text-green-500 mt-2">
              Tu robot está recargado. Vuelve mañana.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 w-full max-w-lg mx-auto">
            <h3 className="text-sm text-slate-400 uppercase tracking-widest font-bold text-center mb-4">
              Misiones Detectadas
            </h3>
            {dashboardData.todaySession.missions.map(
              (mission: any, index: number) => {
                const isDone =
                  dashboardData.todaySession.completedMissions?.includes(
                    mission._id,
                  );

                return (
                  <div
                    key={mission._id}
                    className={`border-2 p-4 rounded-xl flex items-center justify-between transition-colors ${isDone ? "bg-green-900/20 border-green-500/50" : "bg-slate-800 border-slate-700 hover:border-cyan-500"}`}
                  >
                    <div>
                      <h4
                        className={`font-bold text-lg ${isDone ? "text-green-400" : "text-white"}`}
                      >
                        Misión {index + 1}: {mission.title}
                      </h4>
                      <p
                        className={`${isDone ? "text-green-500/70" : "text-cyan-400"} text-sm flex items-center gap-1`}
                      >
                        <Zap className="w-4 h-4" /> +{mission.energyReward}{" "}
                        Cristales
                      </p>
                    </div>

                    {isDone ? (
                      <div className="w-12 h-12 flex items-center justify-center bg-green-500/20 rounded-full border border-green-500/50 shadow-[0_0_15px_-3px_#22c55e]">
                        <span className="text-2xl">✅</span>
                      </div>
                    ) : (
                      <Link
                        href={`/misiones/${mission._id}`}
                        className="bg-cyan-600 hover:bg-cyan-500 rounded-full w-12 h-12 flex items-center justify-center transition-transform hover:scale-110 shadow-[0_0_20px_-5px_#06b6d4]"
                      >
                        <Play className="w-6 h-6 ml-1 text-white" />
                      </Link>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}
