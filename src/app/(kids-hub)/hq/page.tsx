// src/app/(kids-hub)/hq/page.tsx
import {
  Target,
  Star,
  Shield,
  Play,
  Lock,
  CheckCircle,
  Battery,
  ShoppingCart,
  BookOpen,
  Beaker,
  Zap,
} from "lucide-react";
import { client } from "@/sanity/lib/client";
import { getKidDashboardQuery } from "@/sanity/lib/queries";
import Link from "next/link";
import { getActiveKidId, clearKidProfile } from "@/app/actions/profile.actions";
import { redirect } from "next/navigation";
import { getAvatarIcon } from "@/lib/utils";

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

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500 pb-16">
      {/* Cabecera dinámica */}
      <div className="text-center space-y-4 w-full">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600 tracking-tight mb-6">
          Cuartel General
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Identificación del Cadete */}
          <div className="flex items-center gap-4 bg-slate-900 border-2 border-slate-800 p-4 rounded-3xl w-full max-w-sm justify-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center text-4xl shadow-lg relative">
              {getAvatarIcon(dashboardData.activeAvatar)}
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="text-left">
              <p className="text-slate-400 font-mono text-sm uppercase tracking-wider">
                Modo Entrenamiento
              </p>
              <h1 className="text-2xl font-black text-white">
                ¡Hola, {dashboardData.alias}!
              </h1>
            </div>
          </div>

          {/* Energía Acumulada */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 flex items-center gap-4 w-full max-w-sm justify-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl border-2 border-slate-700 flex items-center justify-center">
              <Shield className="w-8 h-8 text-slate-500" />
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">
                Energía
              </p>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                <span className="text-3xl font-mono font-bold text-yellow-400">
                  {dashboardData.energyCrystals}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ZONA DE MISIONES (Panel Central) */}
      <div className="w-full mt-4 bg-slate-900/50 p-6 rounded-[2.5rem] border-2 border-slate-800/50">
        <h3 className="text-sm text-cyan-400 uppercase tracking-widest font-black text-center mb-6">
          Misiones del Día
        </h3>

        {!dashboardData.todaySession ? (
          <div className="text-center bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
            <h3 className="text-2xl text-slate-300">
              No hay misiones asignadas para hoy.
            </h3>
            <p className="text-slate-500 mt-2">
              Dile a tu comandante (tus padres) que preparen tu ruta.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 w-full max-w-lg mx-auto">
            {dashboardData.todaySession.isCompleted && (
              <div className="text-center bg-green-900/20 p-6 rounded-2xl border border-green-500/30 mb-4">
                <h3 className="text-2xl text-green-400 font-bold">
                  ¡Día Superado!
                </h3>
                <p className="text-green-500 mt-1 text-sm">
                  Tu robot está recargado. Vuelve mañana.
                </p>
              </div>
            )}

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
                        className={`${isDone ? "text-green-500/70" : "text-cyan-400"} text-sm flex items-center gap-1 font-mono mt-1`}
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

      {/* 🔥 NUEVO: ZONA DE NAVEGACIÓN SECUNDARIA (Tienda, Cursos, Actividades) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Portal a Tienda */}
        <Link
          href="/hq/store"
          className="bg-linear-to-br from-yellow-500 to-orange-600 p-6 rounded-3xl border-4 border-yellow-400/50 shadow-lg hover:scale-105 transition-all flex flex-col justify-between group h-full"
        >
          <ShoppingCart className="w-10 h-10 text-slate-950 mb-4 opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
          <div>
            <h3 className="text-xl font-black text-slate-950 leading-tight">
              Bazar Espacial
            </h3>
            <p className="text-yellow-900 font-bold text-xs mt-1 uppercase">
              Gasta cristales
            </p>
          </div>
        </Link>

        {/* Portal a Cursos */}
        <Link
          href="/cursos"
          className="bg-slate-800 p-6 rounded-3xl border-4 border-slate-700 hover:border-purple-500 shadow-lg hover:scale-105 transition-all flex flex-col justify-between group h-full"
        >
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-purple-500 transition-colors mb-4">
            <BookOpen className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors leading-tight">
              Academia
            </h3>
            <p className="text-slate-400 font-bold text-xs mt-1 uppercase">
              Aprende habilidades
            </p>
          </div>
        </Link>

        {/* Portal a Actividades */}
        <Link
          href="/actividades"
          className="bg-slate-800 p-6 rounded-3xl border-4 border-slate-700 hover:border-emerald-500 shadow-lg hover:scale-105 transition-all flex flex-col justify-between group h-full"
        >
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors mb-4">
            <Beaker className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">
              Laboratorio
            </h3>
            <p className="text-slate-400 font-bold text-xs mt-1 uppercase">
              Ejercicios físicos
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
