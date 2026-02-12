import { Progress } from "@/components/ui/progress";
import { Flag } from "lucide-react";
import LessonObjective from "../lesson-objective/lesson-objective";

export const LessonHeader = () => {
  return (
    <header className="mb-8">
      <p className="text-sm text-gray-500">
        Cursos &gt; Aventura Emocional &gt; Lección 1.1
      </p>
      <div className="flex items-center gap-2 mt-4">
        <p className="text-xs font-bold tracking-wider uppercase">
          Progreso del curso
        </p>
        <Progress
          value={15}
          className="w-32"
          indicatorClassName="bg-[oklch(var(--brand-mustard))]"
        />
        <p className="text-sm font-bold">15%</p>
      </div>
      <h1 className="text-3xl font-bold mt-2">
        Lección 1.1: ¿Qué es la alegría?
      </h1>
      <LessonObjective classname="mt-4">
        <div className="flex items-start gap-4">
          <div className="bg-white p-2 rounded-full border border-amber-200">
            <Flag className="text-amber-500 w-6 h-6 shrink-0 mt-1" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Objetivos de la Lección
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Reconocer la alegría en situaciones cotidianas.</li>
              <li>Identificar las sensaciones físicas de la alegría.</li>
              <li>Aprender a expresar la alegría de forma saludable.</li>
            </ul>
          </div>
        </div>
      </LessonObjective>
    </header>
  );
};
