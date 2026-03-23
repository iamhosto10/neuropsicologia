"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Battery,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitQuizAnswer } from "@/app/actions/quiz.actions";

interface InteractiveQuizProps {
  question: string;
  options: string[];
  correctOptionIndex: number;
  reward: number;
  lessonId: string;
  isAlreadyCompleted: boolean;
  currentPath: string;
}

export default function InteractiveQuiz({
  question,
  options,
  correctOptionIndex,
  reward,
  lessonId,
  isAlreadyCompleted,
  currentPath,
}: InteractiveQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(isAlreadyCompleted);
  const [isPending, startTransition] = useTransition();

  const handleOptionClick = (index: number) => {
    if (hasAnswered || isPending) return;

    setSelected(index);
    const isCorrect = index === correctOptionIndex;

    // Reproducimos el sonido correspondiente
    const audio = new Audio(
      isCorrect ? "/sounds/ui-correct.mp3" : "/sounds/error-buzz.mp3",
    );
    audio.play().catch((e) => console.log("Audio play failed:", e));

    startTransition(async () => {
      await submitQuizAnswer(lessonId, isCorrect, reward, currentPath, index);
      setHasAnswered(true);
    });
  };

  return (
    <Card className="my-12 overflow-hidden rounded-3xl border-slate-100 shadow-md">
      <CardHeader className="bg-[oklch(var(--learning-purple))] p-5 flex flex-row items-center gap-3 border-b border-purple-100/50 space-y-0">
        <div className="bg-white/60 p-2 rounded-full shadow-sm">
          <HelpCircle className="w-6 h-6 text-purple-700" />
        </div>
        <h3 className="text-xl font-black text-purple-900 m-0">
          ¿Comprobamos lo aprendido?
        </h3>
      </CardHeader>

      <CardContent className="p-6 md:p-8 bg-white">
        <p className="text-xl text-slate-800 font-medium mb-8">{question}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((option, index) => {
            const isSelected = selected === index;
            const isCorrectOption = index === correctOptionIndex;

            // Determinamos las clases visuales según el estado de la respuesta
            let optionClasses =
              "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-slate-700";
            let Icon = null;

            if (hasAnswered) {
              if (isCorrectOption) {
                optionClasses =
                  "border-green-400 bg-green-50 text-green-900 relative ring-2 ring-green-400/20";
                Icon = (
                  <CheckCircle className="w-6 h-6 text-green-500 absolute top-4 right-4" />
                );
              } else if (isSelected) {
                optionClasses =
                  "border-red-300 bg-red-50 text-red-900 relative";
                Icon = (
                  <XCircle className="w-6 h-6 text-red-400 absolute top-4 right-4" />
                );
              } else {
                optionClasses =
                  "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
              }
            } else if (isSelected && isPending) {
              optionClasses =
                "border-blue-400 bg-blue-50 text-blue-900 relative";
              Icon = (
                <Loader2 className="w-6 h-6 text-blue-500 absolute top-4 right-4 animate-spin" />
              );
            }

            return (
              <div
                key={index}
                onClick={() => handleOptionClick(index)}
                className={cn(
                  "border-2 rounded-2xl p-5 md:p-6 cursor-pointer transition-all duration-300 flex flex-col justify-center min-h-24",
                  optionClasses,
                  (hasAnswered || isPending) && "cursor-default hover:bg-auto",
                )}
              >
                {Icon}
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 shadow-sm",
                      hasAnswered && isCorrectOption
                        ? "bg-green-200 text-green-800"
                        : hasAnswered && isSelected && !isCorrectOption
                          ? "bg-red-200 text-red-800"
                          : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {["A", "B", "C", "D"][index]}
                  </span>
                  <p className="font-semibold text-lg leading-snug pr-6 m-0">
                    {option}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* FOOTER DE FEEDBACK (Solo aparece al responder) */}
      {hasAnswered && (
        <CardFooter className="p-0 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div
            className={cn(
              "w-full p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between",
              selected === correctOptionIndex || isAlreadyCompleted
                ? "bg-[oklch(var(--learning-success))] text-green-900"
                : "bg-red-50 text-red-900 border-t border-red-100",
            )}
          >
            <div className="flex items-center gap-3">
              {selected === correctOptionIndex || isAlreadyCompleted ? (
                <>
                  <CheckCircle className="w-7 h-7 text-green-600 shrink-0" />
                  <p className="font-bold text-lg m-0">
                    ¡Correcto! Entendiste muy bien este punto.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-7 h-7 text-red-500 shrink-0" />
                  <p className="font-bold text-lg m-0">
                    Esa no era la opción correcta. ¡Sigue leyendo con atención!
                  </p>
                </>
              )}
            </div>

            {/* Recompensa atómica: Solo la mostramos si es la primera vez que acierta */}
            {selected === correctOptionIndex && !isAlreadyCompleted && (
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
