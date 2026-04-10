// src/app/(login)/dashboard/kid/[id]/assign/page.tsx
import { client } from "@/sanity/lib/client";
import {
  ArrowLeft,
  CalendarDays,
  Plus,
  CalendarCheck,
  CalendarX,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteDailySession } from "@/app/actions/mission.actions";
import DeleteSessionButton from "@/components/dashboard/delete-session-button";

export const dynamic = "force-dynamic";

export default async function AgendaMisionesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // 1. Traemos TODAS las sesiones programadas y pasadas del niño
  const sessions = await client.withConfig({ useCdn: false }).fetch(
    `*[_type == "dailySession" && kidProfile._ref == $id] | order(date desc) {
      _id,
      date,
      isCompleted,
      "missionCount": count(missions),
      "completedCount": count(completedMissions)
    }`,
    { id },
    { cache: "no-store" },
  );

  // 2. Lógica para separar: "Próximas" (hoy o futuro) vs "Pasadas"
  // NOTA: Usamos la fecha en Bogotá/Colombia (UTC-5) para ser precisos
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });

  const upcomingSessions = sessions
    .filter((s: any) => s.date >= today)
    .reverse(); // Ordenamos de más cercana a más lejana
  const pastSessions = sessions.filter((s: any) => s.date < today);

  // Helper visual para las tarjetas
  const SessionCard = ({
    session,
    isPast,
  }: {
    session: any;
    isPast: boolean;
  }) => {
    // Formateo de fecha legible
    const dateObj = new Date(`${session.date}T12:00:00`); // Aseguramos que no cambie de día por zonas horarias
    const formattedDate = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const isToday = session.date === today;

    return (
      <Card
        className={`rounded-2xl shadow-sm border-slate-200 overflow-hidden transition-all hover:shadow-md ${isPast ? "opacity-80 bg-slate-50" : "bg-white"}`}
      >
        <div
          className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${isToday ? "bg-cyan-50" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isPast ? "bg-slate-200" : isToday ? "bg-cyan-200 text-cyan-700" : "bg-indigo-100 text-indigo-600"}`}
            >
              {session.isCompleted ? (
                <CalendarCheck className="w-5 h-5 text-green-600" />
              ) : isPast ? (
                <CalendarX className="w-5 h-5 text-slate-500" />
              ) : (
                <CalendarDays className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 capitalize leading-tight">
                {isToday ? "Hoy, " : ""}
                {formattedDate}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {session.isCompleted
                  ? "Estado: Completada"
                  : isPast
                    ? "Estado: Vencida"
                    : "Estado: Programada"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-4 hidden sm:block">
              <p className="text-2xl font-black text-slate-800 leading-none">
                {session.missionCount || 0}
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Juegos
              </p>
            </div>

            {/* Botones de Acción (Si está en el pasado o completada, a veces es mejor no dejar editar, pero te dejo la opción abierta) */}
            {!session.isCompleted && (
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/kid/${id}/assign/planificador?date=${session.date}`}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </Link>
                {/* Formulario Server Action para eliminar */}
                <DeleteSessionButton sessionId={session._id} kidId={id} />
              </div>
            )}
          </div>
        </div>

        {/* Barra de progreso visual si hay juegos terminados */}
        {session.missionCount > 0 && (
          <div className="h-1.5 w-full bg-slate-100">
            <div
              className={`h-full ${session.isCompleted ? "bg-green-500" : "bg-cyan-400"}`}
              style={{
                width: `${(session.completedCount / session.missionCount) * 100}%`,
              }}
            />
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto md:p-8 space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CABECERA (Nav) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/kid/${id}`}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-sm hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <CalendarDays className="text-indigo-500 w-8 h-8" /> Agenda
              Clínica
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Gestiona el plan de entrenamiento cognitivo por fechas.
            </p>
          </div>
        </div>

        {/* EL BOTÓN GIGANTE PARA CREAR */}
        <Link href={`/dashboard/kid/${id}/assign/planificador`}>
          <Button className="rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-900/20 px-6">
            <Plus className="w-5 h-5 mr-2" /> Programar Nueva Fecha
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
        {/* COLUMNA 1: PRÓXIMAS MISIONES */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Clock className="w-5 h-5 text-cyan-500" /> Próximos Entrenamientos
          </h2>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session: any) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  isPast={false}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-10 text-center">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-600">Agenda vacía</p>
              <p className="text-sm text-slate-500 mt-1">
                No hay entrenamientos programados para hoy ni para el futuro.
              </p>
            </div>
          )}
        </div>

        {/* COLUMNA 2: MISIONES PASADAS */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-500 flex items-center gap-2 border-b border-slate-200 pb-3">
            <CalendarCheck className="w-5 h-5" /> Historial Pasado
          </h2>

          {pastSessions.length > 0 ? (
            <div className="space-y-4">
              {pastSessions.map((session: any) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  isPast={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8 italic">
              No hay registros de fechas anteriores.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
