import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { getKidClinicalReportQuery } from "@/sanity/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Brain,
  Battery,
  Calendar,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import CognitiveChart from "@/components/dashboard/cognitive-chart";

export default async function KidReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const { userId } = await auth();
  const userClerk = await currentUser();

  if (!userId) redirect("/sign-in");

  const sanityUserId = `user-${userClerk?.id}`;

  // Buscamos los datos validando que este niño le pertenece a este padre
  const kidData = await client.fetch(getKidClinicalReportQuery, {
    kidId: id,
    parentSanityId: sanityUserId,
  });

  // Medida de seguridad: Si no encuentra el niño (o si intentan ver el hijo de otro)
  if (!kidData) {
    return (
      <div className="p-8 text-center">
        <h2>Perfil no encontrado o acceso denegado.</h2>
        <Link href="/dashboard">
          <Button className="mt-4">Volver al Panel</Button>
        </Link>
      </div>
    );
  }

  const totalSessions = kidData.sessionsHistory?.length || 0;
  const completedSessions =
    kidData.sessionsHistory?.filter((s: any) => s.isCompleted).length || 0;

  return (
    <div className="max-w-6xl mx-auto md:p-8 space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabecera / Botón de Regreso */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-sm hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Reporte de {kidData.alias}
          </h1>
          <p className="text-slate-500 text-sm">
            Identificador Clínico: {kidData._id.split("-").pop()}
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-[oklch(var(--dash-blue-pastel))]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/80 p-4 rounded-full text-blue-600">
              <Battery className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">
                Cristales Generados
              </p>
              <p className="text-3xl font-black text-slate-900">
                {kidData.energyCrystals}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-[oklch(var(--dash-green-pastel))]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/80 p-4 rounded-full text-green-600">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">
                Días Entrenados
              </p>
              <p className="text-3xl font-black text-slate-900">
                {totalSessions}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-[oklch(var(--dash-amber-pastel))]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/80 p-4 rounded-full text-amber-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">
                Tasa de Completitud
              </p>
              <p className="text-3xl font-black text-slate-900">
                {totalSessions > 0
                  ? Math.round((completedSessions / totalSessions) * 100)
                  : 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de Progreso y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica */}
        <Card className="rounded-[2rem] shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-600" /> Curva de Constancia
              Terapéutica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CognitiveChart sessions={kidData.sessionsHistory || []} />
          </CardContent>
        </Card>

        {/* Historial Detallado */}
        <Card className="rounded-[2rem] shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle>Últimas Sesiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kidData.sessionsHistory?.length > 0 ? (
                kidData.sessionsHistory.map((session: any) => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800">
                        {new Date(session.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <p className="text-xs text-slate-500">
                        Misiones: {session.completedCount || 0} /{" "}
                        {session.assignedCount || 0}
                      </p>
                    </div>
                    {session.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  No hay registros de juego aún.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
