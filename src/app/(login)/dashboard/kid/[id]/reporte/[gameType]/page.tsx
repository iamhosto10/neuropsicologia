// src/app/(login)/dashboard/kid/[id]/reporte/[gameType]/page.tsx
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain, Calendar, Info, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Importamos las herramientas clínicas
import { CLINICAL_DICTIONARY } from "@/lib/clinical-dictionary";

export default async function GameClinicalReportPage({
  params,
}: {
  params: { id: string; gameType: string };
}) {
  const { id, gameType } = await params;

  // 1. Validamos que el juego exista en nuestro diccionario
  const gameDictionary = CLINICAL_DICTIONARY[gameType];
  if (!gameDictionary) notFound();

  // 2. Traemos TODO el historial de sesiones del niño de una sola vez
  const kidQuery = `
    *[_type == "kidProfile" && _id == $id][0]{ 
      alias, 
      "sessionsHistory": *[_type == "dailySession" && references(^._id)] | order(date desc) {
        _id,
        date,
        telemetryData
      }
    }
  `;
  const kidData = await client
    .withConfig({ useCdn: false })
    .fetch(kidQuery, { id }, { cache: "no-store" });

  if (!kidData) notFound();

  // 🔥 3. EL NUEVO COLADOR SUPER VELOZ 🔥
  // Leemos los JSON y buscamos solo los que tienen la "etiqueta" del juego actual
  const gameSessions: { date: string; metrics: any }[] = [];

  kidData.sessionsHistory?.forEach((session: any) => {
    session.telemetryData?.forEach((telemetryString: string) => {
      try {
        const parsed = JSON.parse(telemetryString);
        // Si la telemetría dice que es este juego, la guardamos para las gráficas
        if (parsed.gameType === gameType) {
          gameSessions.push({ date: session.date, metrics: parsed.metrics });
        }
      } catch (e) {
        console.error("Error leyendo JSON de telemetría", e);
      }
    });
  });

  return (
    <div className="max-w-5xl mx-auto md:p-8 space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
            <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900">
              {gameDictionary.title}
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-600" />
              {gameDictionary.domain}
            </p>
          </div>
        </div>
      </div>

      {/* DICCIONARIO CLÍNICO */}
      <Card className="rounded-[2rem] border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity className="w-48 h-48" />
        </div>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-cyan-400">
            <Info className="w-5 h-5" /> Guía de Interpretación Clínica
          </CardTitle>
          <p className="text-slate-300 max-w-3xl leading-relaxed">
            {gameDictionary.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 relative z-10">
            {Object.entries(gameDictionary.metrics).map(([key, metric]) => (
              <div
                key={key}
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700"
              >
                <p className="font-bold text-cyan-300 text-sm mb-1">
                  {metric.label}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BITÁCORA CRONOLÓGICA */}
      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" /> Historial de
          Evaluaciones
        </h2>

        {gameSessions.length > 0 ? (
          <div className="space-y-6">
            {gameSessions.map((session, index) => {
              const dateObj = new Date(`${session.date}T12:00:00`);
              const formattedDate = dateObj.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <Card
                  key={`${session.date}-${index}`}
                  className="rounded-2xl shadow-sm border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                    <p className="font-bold text-slate-700 capitalize">
                      {formattedDate}
                    </p>
                    <div className="bg-cyan-100 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Sesión Completada
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {Object.entries(gameDictionary.metrics).map(
                        ([metricKey, metricDef]) => {
                          const rawValue = session.metrics[metricKey];
                          if (rawValue === undefined || rawValue === null)
                            return null;

                          let displayValue = rawValue.toString();
                          if (metricDef.isPercentage)
                            displayValue = `${rawValue}%`;
                          if (metricDef.isTime) displayValue = `${rawValue} ms`;

                          return (
                            <div
                              key={metricKey}
                              className="flex flex-col space-y-1"
                            >
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {metricDef.label}
                              </span>
                              <span className="text-2xl font-black text-slate-800">
                                {displayValue}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              No hay datos clínicos aún
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              El cadete {kidData.alias} aún no ha completado misiones de{" "}
              <strong>{gameDictionary.title}</strong> bajo este nuevo sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
