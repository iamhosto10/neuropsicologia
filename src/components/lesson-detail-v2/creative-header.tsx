import { Palette } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import LessonObjective from "../lesson-objective/lesson-objective";

export function CreativeHeader() {
  return (
    <header className="mb-8">
      <p className="text-sm text-gray-500">
        Cursos &gt; Dibujo Creativo &gt; Lección 1.2
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
        Lección 1.2: Dibujando emociones
      </h1>
      <LessonObjective classname="mt-4">
        <div className="flex items-start gap-4">
          <div className="bg-white p-2 rounded-full border border-amber-200">
            <Palette className="h-6 w-6 text-[oklch(var(--creative-amber))]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Objetivos de la lección
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Aprender a combinar formas básicas para crear personajes.</li>
              <li>
                Entender cómo las expresiones faciales transmiten emociones.
              </li>
              <li>
                Practicar el dibujo de al menos tres expresiones diferentes.
              </li>
            </ul>
          </div>
        </div>
      </LessonObjective>
    </header>
  );
}
