// src/components/dashboard/dashboard-overview.tsx
"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Check,
  Gamepad2,
  GraduationCap,
  Lightbulb,
  Puzzle,
  Trophy,
  Battery,
  Activity,
  ArrowRight,
  Shield,
} from "lucide-react";
import Link from "next/link";

// Añadimos una interfaz para recibir los datos de Sanity
interface DashboardOverviewProps {
  kidsData?: any[];
}

const DashboardOverview = ({ kidsData = [] }: DashboardOverviewProps) => {
  return (
    <div className="bg-gray-50 p-6 rounded-3xl">
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda (Principal) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Header de Bienvenida para el Padre */}
          <Card className="rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-100 p-4 rounded-full text-cyan-600">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Panel Familiar</h2>
                <p className="text-muted-foreground">
                  Monitorea el progreso de tus cadetes.
                </p>
              </div>
            </div>
            {/* Botón para que el padre pueda entrar al modo niños (Selección de perfil) */}
            <Link href="/select-profile">
              <Button className="rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800">
                Entrar al Modo Niños <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>

          {/* 🔥 SECCIÓN DINÁMICA: Renderizamos los perfiles de los niños */}
          <h3 className="text-xl font-bold mt-4 -mb-4 px-2">
            Mis Cadetes Activos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {kidsData.length > 0 ? (
              kidsData.map((kid: any) => {
                // Calculamos el progreso diario
                const isTodayCompleted = kid.latestSession?.isCompleted;
                const progress = kid.latestSession
                  ? Math.round(
                      ((kid.latestSession.completedMissions?.length || 0) /
                        (kid.latestSession.missions?.length || 1)) *
                        100,
                    )
                  : 0;

                return (
                  <Card
                    key={kid._id}
                    className="rounded-[2rem] p-6 shadow-sm hover:-translate-y-1 transition-transform border-none bg-white"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-cyan-100">
                          <AvatarFallback className="bg-cyan-50 text-cyan-700 font-bold">
                            {kid.alias.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">{kid.alias}</h3>
                          <div className="flex items-center text-xs font-mono text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full w-max mt-1">
                            <Battery className="w-3 h-3 mr-1" />{" "}
                            {kid.energyCrystals} Energía
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-600">Dosis Diaria</span>
                        <span
                          className={
                            isTodayCompleted
                              ? "text-green-600"
                              : "text-cyan-600"
                          }
                        >
                          {isTodayCompleted ? "¡Lista!" : `${progress}%`}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2.5"
                        indicatorClassName={
                          isTodayCompleted
                            ? "bg-green-500"
                            : "bg-[oklch(var(--dash-progress-blue))]"
                        }
                      />
                    </div>

                    <Link href={`/dashboard/kid/${kid._id}`}>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl gap-2 border-slate-200 hover:bg-slate-50"
                      >
                        <Activity className="w-4 h-4 text-cyan-600" /> Ver
                        Reporte Clínico
                      </Button>
                    </Link>
                  </Card>
                );
              })
            ) : (
              <Card className="rounded-[2rem] p-6 border-dashed border-2 flex flex-col items-center justify-center col-span-2 bg-transparent opacity-60">
                <p className="text-slate-500 mb-2">
                  No hay perfiles registrados.
                </p>
                <Link
                  href="/dashboard/add-cadet"
                  className="text-cyan-600 underline text-sm"
                >
                  Reclutar mi primer cadete
                </Link>
              </Card>
            )}
          </div>

          {/* Tus botones de "Quick Actions" originales (mantenidos abajo por diseño) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="rounded-[2rem] p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:-translate-y-1 transition-transform bg-[oklch(var(--dash-blue-pastel))]">
              <div className="bg-white/80 rounded-full p-3">
                <Puzzle className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg">Actividades</h3>
            </Card>
            <Card className="rounded-[2rem] p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:-translate-y-1 transition-transform bg-[oklch(var(--dash-amber-pastel))]">
              <div className="bg-white/80 rounded-full p-3">
                <GraduationCap className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-bold text-lg">Cursos</h3>
            </Card>
            <Card className="rounded-[2rem] p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:-translate-y-1 transition-transform bg-[oklch(var(--dash-green-pastel))]">
              <div className="bg-white/80 rounded-full p-3">
                <Gamepad2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-bold text-lg">Juegos</h3>
            </Card>
          </div>
        </div>

        {/* Columna Derecha (Sidebar) - SE MANTIENE EXACTAMENTE IGUAL */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Agenda Widget */}
          <Card className="rounded-[2rem] p-6 shadow-sm h-fit animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="flex flex-row items-center gap-2 p-0 mb-4">
              <Calendar className="h-6 w-6" />
              <CardTitle>Agenda del Día</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 opacity-60">
                    <Check className="h-5 w-5" />
                    <p className="line-through">10:00 - Desayuno</p>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-xl font-semibold">
                    <p>15:00 - Terapia del Habla</p>
                  </div>
                  <div>
                    <p>17:00 - Lección de Inglés</p>
                  </div>
                </div>
              </ScrollArea>
              <Button className="w-full mt-4 bg-[oklch(var(--brand-mustard))] font-bold hover:bg-[oklch(var(--brand-mustard)/0.9)]">
                Ver Checklist Completo
              </Button>
            </CardContent>
          </Card>

          {/* Tip Card */}
          <div className="bg-linear-to-br from-[oklch(var(--dash-gradient-start))] to-[oklch(var(--dash-gradient-end))] rounded-[2rem] p-6 text-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative z-10">
              <Lightbulb className="h-8 w-8 mb-2" />
              <h3 className="font-bold text-lg mb-1">Consejo del Día</h3>
              <p>
                El juego regular ayuda a desarrollar la flexibilidad cognitiva.
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-8 -right-1 h-16 w-16 rounded-full bg-white/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
