import { CheckCircle2 } from "lucide-react";

const objectives = [
  "Comprender los fundamentos de la neuropsicología.",
  "Aplicar técnicas de evaluación neuropsicológica.",
  "Diseñar planes de intervención personalizados.",
  "Analizar casos clínicos complejos.",
  "Integrar los conocimientos en la práctica profesional.",
];

export function CourseContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Section A: About */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Sobre este curso</h2>
        <p className="text-muted-foreground">
          Este curso intensivo proporciona una formación completa en
          neuropsicología, abarcando desde los principios teóricos hasta la
          aplicación práctica en diversos contextos clínicos. Aprenderás a
          evaluar, diagnosticar y tratar trastornos neuropsicológicos,
          desarrollando habilidades críticas para tu carrera.
        </p>
      </div>

      {/* Section B: Objectives */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Objetivos de Aprendizaje</h2>
        <ul className="space-y-3">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-[oklch(var(--brand-sky))] shrink-0 mt-1" />
              <span className="flex-1">{objective}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
