"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  MessageCircle,
  CheckCircle,
  Loader2,
  Battery,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { submitOpenAnswer } from "@/app/actions/open-question.actions";

interface InteractiveOpenQuestionProps {
  question: string;
  reward: number;
  lessonId: string;
  isAlreadyCompleted: boolean;
  currentPath: string;
  blockKey: string;
}

export default function InteractiveOpenQuestion({
  question,
  reward,
  lessonId,
  isAlreadyCompleted,
  currentPath,
  blockKey,
}: InteractiveOpenQuestionProps) {
  const [text, setText] = useState("");
  const [hasAnswered, setHasAnswered] = useState(isAlreadyCompleted);
  const [isPending, startTransition] = useTransition();

  // Requerimos al menos 10 caracteres para que no escriban solo "sí" o "no"
  const isTooShort = text.trim().length < 10;

  const handleSubmit = () => {
    if (hasAnswered || isPending || isTooShort) return;

    const audio = new Audio("/sounds/ui-correct.mp3");
    audio.play().catch((e) => console.log("Audio play failed:", e));

    startTransition(async () => {
      await submitOpenAnswer(lessonId, text, reward, currentPath, blockKey);
      setHasAnswered(true);
    });
  };

  return (
    <Card className="my-12 overflow-hidden rounded-3xl border-slate-100 shadow-md">
      <CardHeader className="bg-[oklch(var(--learning-purple))] p-5 flex flex-row items-center gap-3 border-b border-purple-100/50 space-y-0">
        <div className="bg-white/60 p-2 rounded-full shadow-sm">
          <MessageCircle className="w-6 h-6 text-purple-700" />
        </div>
        <h3 className="text-xl font-black text-purple-900 m-0">
          Momento de Reflexión
        </h3>
      </CardHeader>

      <CardContent className="p-6 md:p-8 bg-white">
        <p className="text-xl text-slate-800 font-medium mb-6">{question}</p>

        {!hasAnswered ? (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full min-h-30 p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 outline-none transition-all resize-y text-slate-700 text-lg"
              disabled={isPending}
            />
            <div className="flex justify-between items-center">
              <p
                className={cn(
                  "text-xs font-bold",
                  isTooShort ? "text-slate-400" : "text-green-500",
                )}
              >
                {text.length} caracteres {isTooShort && "(mínimo 10)"}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isPending || isTooShort}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 h-12 shadow-md gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Enviar Respuesta
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 italic text-slate-600 text-lg">
            "¡Ya enviaste tu respuesta! El comandante está revisando tus notas."
          </div>
        )}
      </CardContent>

      {hasAnswered && (
        <CardFooter className="p-0 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="w-full p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[oklch(var(--learning-success))] text-green-900">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-green-600 shrink-0" />
              <p className="font-bold text-lg m-0">
                ¡Gracias por compartir tus ideas!
              </p>
            </div>

            {/* Recompensa atómica (oculta si recargan la página) */}
            {!isAlreadyCompleted && (
              <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full font-black text-green-800 shadow-sm">
                +{reward}{" "}
                <Battery className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
