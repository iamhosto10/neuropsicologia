import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  XCircle,
  MessageCircle,
  HelpCircle,
  CalendarClock,
} from "lucide-react";
import { getKidAcademicReportQuery } from "@/lib/query";

export default async function AcademicReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const kidData = await client
    .withConfig({ useCdn: false })
    .fetch(getKidAcademicReportQuery, { kidId: id }, { cache: "no-store" });

  if (!kidData) {
    return (
      <div className="p-8 text-center">
        <h2>Perfil no encontrado.</h2>
        <Link href="/dashboard">
          <Button className="mt-4">Volver al Panel</Button>
        </Link>
      </div>
    );
  }

  const rawTelemetry = kidData.academicTelemetry || [];

  const quizzes = rawTelemetry
    .filter((t: any) => t._type === "quizRecord")
    .map((record: any) => {
      const questionBlock = record.lesson?.content?.find(
        (b: any) => b._key === record.blockKey,
      );

      const options = questionBlock?.options || [];
      const correctIndex = questionBlock?.correctOptionIndex;
      const correctAnswerText =
        options[correctIndex] !== undefined
          ? options[correctIndex]
          : "No definida";

      return {
        ...record,
        lessonTitle: record.lesson?.title || "Lección Desconocida",
        questionText: questionBlock?.question || "Pregunta no encontrada",
        correctAnswerText, // 🔥 Guardamos el texto correcto
        selectedAnswerText: record.selected || "Respuesta no registrada", // 🔥 Guardamos lo que eligió el niño
      };
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  // Procesar Preguntas Abiertas
  const openQuestions = rawTelemetry
    .filter((t: any) => t._type === "openQuestionRecord")
    .map((record: any) => {
      const questionBlock = record.lesson?.content?.find(
        (b: any) => b._key === record.blockKey,
      );
      return {
        ...record,
        lessonTitle: record.lesson?.title || "Lección Desconocida",
        questionText: questionBlock?.question || "Enunciado no encontrado",
      };
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  // Utilidad de formato de fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto md:p-8 space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CABECERA */}
      <div className="flex items-center gap-4 mb-8">
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
            <BookOpen className="w-8 h-8 text-purple-600" />
            Boletín Académico
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Historial de comprensión lectora de {kidData.alias}
          </p>
        </div>
      </div>

      {/* PESTAÑAS (TABS) */}
      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="grid w-full md:w-100 grid-cols-2 mb-8 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="quizzes" className="rounded-lg font-bold">
            Control de Lectura
          </TabsTrigger>
          <TabsTrigger value="open" className="rounded-lg font-bold">
            Desarrollo Escrito
          </TabsTrigger>
        </TabsList>

        {/* CONTENIDO: QUIZZES */}
        <TabsContent value="quizzes" className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-500">
              Aún no hay registros de quizzes completados.
            </div>
          ) : (
            quizzes.map((quiz: any) => (
              <Card
                key={quiz._key}
                className="overflow-hidden rounded-2xl border-slate-100 shadow-sm"
              >
                <CardContent className="p-0">
                  <div
                    className={`p-4 border-b flex items-center justify-between ${quiz.isCorrect ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      {quiz.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <div>
                        <h4
                          className={`font-bold ${quiz.isCorrect ? "text-green-900" : "text-red-900"}`}
                        >
                          {quiz.isCorrect
                            ? "Respuesta Correcta"
                            : "Respuesta Incorrecta"}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <CalendarClock className="w-3 h-3" />{" "}
                          {formatDate(quiz.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {quiz.lessonTitle}
                    </p>
                    <p className="text-lg font-medium text-slate-800 flex items-start gap-2 mb-6">
                      <HelpCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      {quiz.questionText}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                          El cadete eligió:
                        </p>
                        <p
                          className={`font-semibold ${quiz.isCorrect ? "text-green-600" : "text-red-600"}`}
                        >
                          {quiz.selectedAnswerText}
                        </p>
                      </div>

                      {!quiz.isCorrect && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 relative overflow-hidden">
                          <CheckCircle2 className="absolute -right-2 -bottom-2 w-12 h-12 text-green-500 opacity-10" />
                          <p className="text-xs font-bold text-green-600 uppercase mb-1">
                            La respuesta correcta era:
                          </p>
                          <p className="font-semibold text-green-800">
                            {quiz.correctAnswerText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="open" className="space-y-6">
          {openQuestions.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-500">
              Aún no hay respuestas de desarrollo registradas.
            </div>
          ) : (
            openQuestions.map((record: any) => (
              <Card
                key={record._key}
                className="overflow-hidden rounded-3xl border-slate-100 shadow-sm"
              >
                <CardContent className="p-6 md:p-8 bg-white">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <p className="text-sm font-bold text-cyan-600 uppercase tracking-wider bg-cyan-50 px-3 py-1 rounded-full">
                      {record.lessonTitle}
                    </p>
                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1">
                      <CalendarClock className="w-4 h-4" />{" "}
                      {formatDate(record.timestamp)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-slate-800 flex items-start gap-2">
                      <MessageCircle className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                      {record.questionText}
                    </h4>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
                    <span className="absolute top-4 left-4 text-6xl text-slate-200 font-serif leading-none select-none">
                      "
                    </span>
                    <p className="text-slate-700 text-lg leading-relaxed relative z-10 pl-6 italic">
                      {record.responseText}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
