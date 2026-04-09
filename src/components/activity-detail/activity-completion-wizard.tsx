"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { markActivityCompleted } from "@/app/actions/activity.actions";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Zap,
  Loader2,
  Smile,
  Frown,
  Meh,
  Star,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 DICCIONARIO DINÁMICO SEGÚN CATEGORÍA
const getReflectionContent = (category: string = "") => {
  const cat = category?.toLowerCase();
  if (cat) {
    if (
      cat.includes("mindfulness") ||
      cat.includes("calma") ||
      cat.includes("relajación")
    ) {
      return {
        moodQuestion: "¿Cómo sientes tu cuerpo ahora?",
        moodLabels: {
          feliz: "Relajado",
          normal: "Igual",
          frustrado: "Inquieto",
        },
        diffQuestion: "¿Te costó trabajo mantener la concentración?",
        diffLabels: { 1: "Nada", 2: "Un poco", 3: "Muchísimo" },
      };
    }

    if (
      cat.includes("motricidad") ||
      cat.includes("ejercicio") ||
      cat.includes("físic")
    ) {
      return {
        moodQuestion: "¿Cómo quedó tu batería de energía?",
        moodLabels: {
          feliz: "¡A tope!",
          normal: "Normal",
          frustrado: "Cansado",
        },
        diffQuestion: "¿Qué tan difícil fue el ejercicio físico?",
        diffLabels: { 1: "Muy fácil", 2: "Me hizo sudar", 3: "Súper difícil" },
      };
    }

    if (
      cat.includes("rutina") ||
      cat.includes("organización") ||
      cat.includes("orden")
    ) {
      return {
        moodQuestion: "¿Cómo te sientes al ver todo terminado?",
        moodLabels: {
          feliz: "Orgulloso",
          normal: "Normal",
          frustrado: "Agotado",
        },
        diffQuestion: "¿Necesitaste que un adulto te ayudara?",
        diffLabels: {
          1: "Lo hice solo",
          2: "Me ayudaron un poco",
          3: "Me ayudaron mucho",
        },
      };
    }
  }

  // Texto por defecto para cualquier otra categoría
  return {
    moodQuestion: "¿Cómo te sientes ahora mismo?",
    moodLabels: { feliz: "Feliz", normal: "Normal", frustrado: "Frustrado" },
    diffQuestion: "¿Qué tan difícil fue la actividad?",
    diffLabels: { 1: "Muy Fácil", 2: "Un poco difícil", 3: "Me costó mucho" },
  };
};

export default function ActivityCompletionWizard({
  kidId,
  activityId,
  isCompleted,
  category, // Recibimos la categoría
}: {
  kidId: string;
  activityId: string;
  isCompleted: boolean;
  category?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"idle" | "reflect" | "done">(
    isCompleted ? "done" : "idle",
  );
  const pathname = usePathname();

  const [mood, setMood] = useState<"feliz" | "normal" | "frustrado" | null>(
    null,
  );
  const [difficulty, setDifficulty] = useState<number>(0);

  // Cargamos los textos dinámicos
  const content = getReflectionContent(category);

  const handleSubmitReflection = () => {
    if (!kidId || !mood || difficulty === 0) return;

    startTransition(async () => {
      const reflectionData = { mood, difficulty };
      const res = await markActivityCompleted(
        kidId,
        activityId,
        pathname,
        reflectionData,
      );

      if (res.success) {
        setStep("done");
      }
    });
  };

  if (!kidId) return null;

  return (
    <div className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {/* FASE 1: BOTÓN INICIAL */}
        {step === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              ¿Terminaste la actividad?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Asegúrate de haber completado todos los pasos antes de continuar.
            </p>
            <Button
              onClick={() => setStep("reflect")}
              className="w-full h-14 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg rounded-2xl shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02]"
            >
              Sí, completé la misión <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* FASE 2: LA BITÁCORA DINÁMICA */}
        {step === "reflect" && (
          <motion.div
            key="reflect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-2xl font-black text-slate-800">
                Bitácora del Cadete
              </h3>
              <p className="text-slate-500 text-sm">
                Cuéntanos cómo te fue para ganar tus cristales.
              </p>
            </div>

            {/* Pregunta 1: Emoción (DINÁMICA) */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl">
              <p className="font-bold text-slate-700 text-center">
                {content.moodQuestion}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => setMood("feliz")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === "feliz" ? "bg-green-100 border-2 border-green-500 scale-105" : "bg-white border border-slate-200 hover:bg-slate-100"}`}
                >
                  <Smile
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${mood === "feliz" ? "text-green-600" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-xs font-bold text-center leading-tight ${mood === "feliz" ? "text-green-700" : "text-slate-500"}`}
                  >
                    {content.moodLabels.feliz}
                  </span>
                </button>
                <button
                  onClick={() => setMood("normal")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === "normal" ? "bg-amber-100 border-2 border-amber-500 scale-105" : "bg-white border border-slate-200 hover:bg-slate-100"}`}
                >
                  <Meh
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${mood === "normal" ? "text-amber-600" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-xs font-bold text-center leading-tight ${mood === "normal" ? "text-amber-700" : "text-slate-500"}`}
                  >
                    {content.moodLabels.normal}
                  </span>
                </button>
                <button
                  onClick={() => setMood("frustrado")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === "frustrado" ? "bg-red-100 border-2 border-red-500 scale-105" : "bg-white border border-slate-200 hover:bg-slate-100"}`}
                >
                  <Frown
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${mood === "frustrado" ? "text-red-600" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-xs font-bold text-center leading-tight ${mood === "frustrado" ? "text-red-700" : "text-slate-500"}`}
                  >
                    {content.moodLabels.frustrado}
                  </span>
                </button>
              </div>
            </div>

            {/* Pregunta 2: Dificultad (DINÁMICA) */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl">
              <p className="font-bold text-slate-700 text-center">
                {content.diffQuestion}
              </p>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => setDifficulty(star)}
                    className="p-2 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${difficulty >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider h-4">
                {difficulty === 1 && content.diffLabels[1]}
                {difficulty === 2 && content.diffLabels[2]}
                {difficulty === 3 && content.diffLabels[3]}
              </p>
            </div>

            <Button
              onClick={handleSubmitReflection}
              disabled={isPending || !mood || difficulty === 0}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg disabled:opacity-50 transition-all"
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Enviar Reporte y Ganar{" "}
                  <Zap className="w-5 h-5 ml-2 fill-yellow-400 text-yellow-400" />{" "}
                  +20
                </>
              )}
            </Button>

            <button
              onClick={() => setStep("idle")}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 font-medium mt-2"
            >
              Volver a las instrucciones
            </button>
          </motion.div>
        )}

        {/* FASE 3: COMPLETADO */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 text-center"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
            <h3 className="font-black text-2xl">¡Misión Superada!</h3>
            <p className="text-emerald-600/80 font-medium">
              Reflexión guardada en tu bitácora de cadete.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
