// src/app/(login)/dashboard/kid/[id]/page.tsx

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
  Target,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import CognitiveChart from "@/components/dashboard/cognitive-chart";
import AccuracyChart from "@/components/dashboard/accuracy-chart";
import CoursesCard from "@/components/courses/courses-card";
import { selectKidAndRedirect } from "@/app/actions/profile.actions";

// 🔥 IMPORTAMOS NUESTRO MOTOR CLÍNICO
import {
  parseTelemetryHistory,
  generateAccuracyChartData,
} from "@/lib/telemetry-engine";

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

  console.log(completedLessons, "completed lesson");

  // 3. LA CONSULTA CORREGIDA: Entramos al syllabus y sacamos las referencias de las lecciones
  const coursesQuery = `*[_type == "course"] {
    _id, title, "slug": slug.current, description, level, "image": image.asset->url,
    "syllabus": syllabus[]{
      "lessonIds": lessons[]._ref
    }
  }`;

  const allCourses = await client.fetch(coursesQuery);

  // 4. LA MATEMÁTICA CORREGIDA
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

  // 5. Ordenamos: Activos (1-99%) > Nuevos (0%) > Completados (100%)
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

  // 🔥 6. EL MOTOR DE TELEMETRÍA EN ACCIÓN
  const sessionsHistory = kidData.sessionsHistory || [];
  console.log(
    "1. SESSIONS HISTORY CRUDA:",
    JSON.stringify(sessionsHistory, null, 2),
  );
  const rawEvents = parseTelemetryHistory(sessionsHistory);
  console.log("2. RAW EVENTS EXTRAIDOS:", rawEvents);
  const accuracyData = generateAccuracyChartData(rawEvents);
  console.log("3. DATA FINAL PARA LA GRÁFICA:", accuracyData);

  return (
    <div className="max-w-6xl mx-auto md:p-8 space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
        <Link href={`/dashboard/kid/${id}/assign`}>
          <Button className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-900/20">
            Asignar Nuevas Misiones
          </Button>
        </Link>
      </div>

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
              <Brain className="w-5 h-5 text-cyan-600" /> Curva de Constancia
              Terapéutica
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
            {/* 🔥 LE PASAMOS LA DATA MATEMÁTICA PROCESADA */}
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
              <BookOpen className="w-6 h-6 text-cyan-600" />
              Academia de {kidData.alias}
            </h2>
            <p className="text-slate-500 mt-1">
              Supervisa el avance de sus módulos educativos individuales.
            </p>
          </div>
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
    </div>
  );
}
