// src/app/(login)/dashboard/kid/[id]/laboratorio/page.tsx
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Beaker, Smile, Frown, Meh, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LaboratorioPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // Traemos el perfil y solo la bitácora de actividades
  const kidData = await client.withConfig({ useCdn: false }).fetch(
    `*[_type == "kidProfile" && _id == $id][0]{
      alias,
      "activityLog": activityLog[]{
        _key,
        completedAt,
        reflection,
        "activityTitle": activityRef->title,
        "activityCategory": activityRef->category
      }
    }`,
    { id },
    { cache: "no-store" },
  );

  if (!kidData) notFound();

  // Aseguramos que la bitácora esté ordenada de más reciente a más antigua
  const activityLog = (kidData.activityLog || []).sort(
    (a: any, b: any) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return (
    <div className="max-w-4xl mx-auto md:p-8 space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CABECERA */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-8">
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
            Laboratorio de {kidData.alias}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Beaker className="w-4 h-4 text-emerald-600" /> Bitácora
            Físico-Emocional
          </p>
        </div>
      </div>

      {/* LÍNEA DE TIEMPO */}
      {activityLog.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 pb-12">
          {activityLog.map((log: any) => {
            const isHappy = log.reflection?.mood === "feliz";
            const isSad = log.reflection?.mood === "frustrado";
            const emojiColor = isHappy
              ? "text-green-500 bg-green-50 border-green-200"
              : isSad
                ? "text-red-500 bg-red-50 border-red-200"
                : "text-amber-500 bg-amber-50 border-amber-200";

            return (
              <div key={log._key} className="relative pl-8 md:pl-12">
                {/* Punto en la línea de tiempo */}
                <div className="absolute -left-2.75 top-6 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-50 shadow-sm" />

                <Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {/* Info de la Actividad */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                            {log.activityCategory || "Laboratorio"}
                          </span>
                          <span className="text-slate-400 text-sm font-medium">
                            {new Date(log.completedAt).toLocaleDateString(
                              "es-ES",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 leading-tight">
                          {log.activityTitle}
                        </h3>
                      </div>

                      {/* La Reflexión Clínica */}
                      {log.reflection && (
                        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 shrink-0">
                          {/* Emoción */}
                          <div className="text-center border-r border-slate-200 pr-4">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">
                              Ánimo
                            </p>
                            <div
                              className={`w-12 h-12 rounded-xl border flex items-center justify-center ${emojiColor}`}
                            >
                              {isHappy && <Smile className="w-7 h-7" />}
                              {isSad && <Frown className="w-7 h-7" />}
                              {!isHappy && !isSad && (
                                <Meh className="w-7 h-7" />
                              )}
                            </div>
                          </div>

                          {/* Dificultad */}
                          <div className="text-center">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">
                              Dificultad
                            </p>
                            <div className="flex gap-1">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${log.reflection.difficulty >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 mt-1">
                              {log.reflection.difficulty === 1 && "Fácil"}
                              {log.reflection.difficulty === 2 && "Media"}
                              {log.reflection.difficulty === 3 && "Alta"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
          <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Laboratorio Vacío
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            El cadete aún no ha completado ninguna actividad física ni
            registrado reflexiones.
          </p>
        </div>
      )}
    </div>
  );
}
