// src/app/(login)/dashboard/kid/[id]/page.tsx

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { getKidClinicalReportQuery } from "@/sanity/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // 🔥 IMPORTAMOS LOS TABS
import {
  ArrowLeft,
  Brain,
  Battery,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  Target,
  BookOpen,
  Focus,
  Dna,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import CognitiveChart from "@/components/dashboard/cognitive-chart";
import AccuracyChart from "@/components/dashboard/accuracy-chart";
import CoursesCard from "@/components/courses/courses-card";
import { selectKidAndRedirect } from "@/app/actions/profile.actions";

import {
  parseTelemetryHistory,
  generateAccuracyChartData,
} from "@/lib/telemetry-engine";
import { CLINICAL_DICTIONARY } from "@/lib/clinical-dictionary";
import PrintReportButton from "@/components/dashboard/print-report-button";

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

  // 1. Buscamos los datos clínicos principales
  const kidData = await client.withConfig({ useCdn: false }).fetch(
    getKidClinicalReportQuery,
    {
      kidId: id,
      parentSanityId: sanityUserId,
    },
    { cache: "no-store" },
  );

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

  // 2. Buscamos las lecciones completadas de ESTE cadete
  const kidExtraData = await client.fetch(
    `*[_type == "kidProfile" && _id == $id][0]{completedLessons}`,
    { id },
  );
  const completedLessons = kidExtraData?.completedLessons || [];

  // 3. Entramos al syllabus y sacamos las referencias de las lecciones
  const coursesQuery = `*[_type == "course"] {
    _id, title, "slug": slug.current, description, level, "image": image.asset->url,
    "syllabus": syllabus[]{
      "lessonIds": lessons[]._ref
    }
  }`;

  const allCourses = await client.fetch(coursesQuery);

  // 4. Progreso de cursos
  const coursesWithProgress = allCourses.map((course: any) => {
    const courseLessonIds =
      course.syllabus?.flatMap((mod: any) => mod.lessonIds || []) || [];
    const total = courseLessonIds.length;

    if (total === 0) return { ...course, progress: 0 };

    const completed = courseLessonIds.filter((lessonId: string) =>
      completedLessons.includes(lessonId),
    ).length;

    return { ...course, progress: Math.round((completed / total) * 100) };
  });

  // 5. Ordenamos
  const sortedCourses = coursesWithProgress.sort((a: any, b: any) => {
    const aPriority =
      a.progress > 0 && a.progress < 100 ? 1 : a.progress === 0 ? 2 : 3;
    const bPriority =
      b.progress > 0 && b.progress < 100 ? 1 : b.progress === 0 ? 2 : 3;
    return aPriority - bPriority;
  });

  const totalSessions = kidData.sessionsHistory?.length || 0;
  const completedSessions =
    kidData.sessionsHistory?.filter((s: any) => s.isCompleted).length || 0;

  // 6. EL MOTOR DE TELEMETRÍA EN ACCIÓN
  const sessionsHistory = kidData.sessionsHistory || [];
  const rawEvents = parseTelemetryHistory(sessionsHistory);
  const accuracyData = generateAccuracyChartData(rawEvents);

  const missionsQueryForPDF = `*[_type == "mission"]{ _id, gameType }`;
  const allMissionsForPDF = await client
    .withConfig({ useCdn: false })
    .fetch(missionsQueryForPDF);
  const missionsMap: Record<string, string> = {};
  allMissionsForPDF.forEach((m: any) => {
    if (m._id && m.gameType) missionsMap[m._id] = m.gameType;
  });

  const latestStatsPerGame: Record<string, { date: string; metrics: any }> = {};

  // Recorremos el historial (que ya viene ordenado del más reciente al más antiguo)
  sessionsHistory.forEach((session: any) => {
    if (!session.telemetryData) return;
    session.telemetryData.forEach((telemetryString: string) => {
      try {
        const parsed = JSON.parse(telemetryString);
        const gameType = missionsMap[parsed.missionId];
        // Si encontramos un juego y aún no lo hemos guardado, es el más reciente
        if (gameType && !latestStatsPerGame[gameType]) {
          latestStatsPerGame[gameType] = {
            date: session.date,
            metrics: parsed.metrics,
          };
        }
      } catch (e) {}
    });
  });

  // 🔥 DEFINIMOS LAS CATEGORÍAS CLÍNICAS PARA LAS PESTAÑAS
  const categories = {
    atencion: [
      "space_cleanup",
      "satellite_tracker",
      "asteroids_go_nogo",
      "multitask_evasion",
    ],
    memoria: ["simon_says_reverse", "cargo_n_back", "reverse_communicator"],
    procesamiento: ["nebula_storm", "signal_decoder", "navigation"],
  };

  // Helper para renderizar las tarjetas de juegos
  const renderGameCards = (gameKeys: string[]) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {gameKeys.map((key) => {
          const gameInfo = CLINICAL_DICTIONARY[key];
          if (!gameInfo) return null;

          return (
            <Card
              key={key}
              className="rounded-2xl border-slate-200 hover:border-purple-200 transition-colors shadow-sm hover:shadow-md flex flex-col bg-white"
            >
              <CardContent className="p-6 flex flex-col h-full justify-between gap-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-xl leading-tight mb-2">
                    {gameInfo.title}
                  </h3>
                  <p className="text-xs font-black text-purple-600 uppercase tracking-wider mb-2">
                    {gameInfo.domain}
                  </p>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {gameInfo.description}
                  </p>
                </div>

                <Link
                  href={`/dashboard/kid/${id}/reporte/${key}`}
                  className="w-full mt-2"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all font-semibold"
                  >
                    Ver Reporte Clínico
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  console.log("3. DATA FINAL PARA LA GRÁFICA:", accuracyData);

  return (
    <div className="max-w-6xl mx-auto md:p-8 space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-3">
          <PrintReportButton
            kidData={kidData}
            totalSessions={totalSessions}
            completedSessions={completedSessions}
            accuracyData={accuracyData}
            detailedStats={latestStatsPerGame}
          />
          <Link href={`/dashboard/kid/${id}/assign`}>
            <Button className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-900/20">
              Asignar Nuevas Misiones
            </Button>
          </Link>
        </div>
      </div>

      {/* 🔥 TABS PRINCIPALES */}
      <Tabs defaultValue="general" className="w-full px-6">
        {/* LISTA DE PESTAÑAS (Arquitectura Grid Responsiva) */}
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full h-auto min-h-fit gap-2 bg-slate-100/80 p-2 rounded-2xl mb-8 border border-slate-200">
          <TabsTrigger
            value="general"
            className="flex items-center justify-start sm:justify-center rounded-xl py-3 px-4 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm transition-all h-auto min-h-12"
          >
            <Brain className="w-5 h-5 sm:w-4 sm:h-4 mr-3 sm:mr-2 shrink-0" />
            <span className="text-left text-wrap leading-tight">
              Resumen General
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="atencion"
            className="flex items-center justify-start sm:justify-center rounded-xl py-3 px-4 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all h-auto min-h-12"
          >
            <Focus className="w-5 h-5 sm:w-4 sm:h-4 mr-3 sm:mr-2 shrink-0" />
            <span className="text-left text-wrap leading-tight">
              Atención y Foco
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="memoria"
            className="flex items-center justify-start sm:justify-center rounded-xl py-3 px-4 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all h-auto min-h-12"
          >
            <Dna className="w-5 h-5 sm:w-4 sm:h-4 mr-3 sm:mr-2 shrink-0" />
            <span className="text-left text-wrap leading-tight">
              Memoria y Flexibilidad
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="procesamiento"
            className="flex items-center justify-start sm:justify-center rounded-xl py-3 px-4 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto min-h-12"
          >
            <Cpu className="w-5 h-5 sm:w-4 sm:h-4 mr-3 sm:mr-2 shrink-0" />
            <span className="text-left text-wrap leading-tight">
              Proc. Complejo
            </span>
          </TabsTrigger>
        </TabsList>
        {/* ==============================================
            TAB 1: RESUMEN GENERAL (Lo que ya tenías)
        ============================================== */}
        <TabsContent
          value="general"
          className="space-y-8 animate-in fade-in duration-500 outline-none"
        >
          {/* TARJETAS DE RESUMEN */}
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

          {/* GRÁFICAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="rounded-[2rem] shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-600" /> Curva de
                  Constancia Terapéutica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CognitiveChart sessions={kidData.sessionsHistory || []} />
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] shadow-sm lg:col-span-2 mt-8 lg:mt-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" /> Evolución de
                  Precisión Clínica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AccuracyChart data={accuracyData} />
              </CardContent>
            </Card>

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
                            {new Date(
                              `${session.date}T12:00:00`,
                            ).toLocaleDateString("es-ES", {
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

          {/* ACADEMIA DEL CADETE */}
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between flex-col md:flex-row gap-4">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
                  <BookOpen className="w-6 h-6 text-cyan-600" />
                  Academia de {kidData.alias}
                </h2>
                <p className="text-slate-500 mt-1">
                  Supervisa el avance de sus módulos educativos individuales.
                </p>
              </div>
              <Link href={`/dashboard/kid/${id}/academico`}>
                <Button className="rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold border-0 shadow-sm transition-colors gap-2">
                  <BookOpen className="w-4 h-4" /> Ver Boletín Académico
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCourses.length > 0 ? (
                sortedCourses.map((course: any) => (
                  <form
                    key={course._id}
                    action={async () => {
                      "use server";
                      await selectKidAndRedirect(id, `/cursos/${course.slug}`);
                    }}
                  >
                    <CoursesCard
                      title={course.title}
                      description={course.description}
                      image={course.image}
                      level={course.level}
                      progress={course.progress}
                      asButton={true}
                    />
                  </form>
                ))
              ) : (
                <p className="text-slate-500">No hay cursos disponibles.</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ==============================================
            TAB 2: ATENCIÓN Y FOCO
        ============================================== */}
        <TabsContent value="atencion" className="outline-none">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Focus className="w-6 h-6 text-amber-500" /> Atención y Foco
            </h2>
            <p className="text-slate-500 mt-1">
              Telemetría de pruebas de atención selectiva, sostenida y control
              inhibitorio.
            </p>
          </div>
          {renderGameCards(categories.atencion)}
        </TabsContent>

        {/* ==============================================
            TAB 3: MEMORIA Y FLEXIBILIDAD
        ============================================== */}
        <TabsContent value="memoria" className="outline-none">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Dna className="w-6 h-6 text-purple-500" /> Memoria y Flexibilidad
              Cognitiva
            </h2>
            <p className="text-slate-500 mt-1">
              Telemetría de pruebas de memoria de trabajo visoespacial y cambio
              atencional.
            </p>
          </div>
          {renderGameCards(categories.memoria)}
        </TabsContent>

        {/* ==============================================
            TAB 4: PROCESAMIENTO COMPLEJO
        ============================================== */}
        <TabsContent value="procesamiento" className="outline-none">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-500" /> Procesamiento Complejo
            </h2>
            <p className="text-slate-500 mt-1">
              Telemetría de velocidad de procesamiento cognitivo y resistencia a
              interferencia (SDMT y Flanker).
            </p>
          </div>
          {renderGameCards(categories.procesamiento)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
