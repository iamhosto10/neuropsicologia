// src/components/features-grid/features-grid.tsx
import { Gamepad2, GraduationCap, Beaker } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

const featuresData = [
  {
    id: 1,
    title: "Misiones Interactivas (Juegos)",
    description:
      "Ejercicios clínicos camuflados como videojuegos espaciales. Diseñados para entrenar la atención, memoria y control inhibitorio sin generar frustración.",
    icon: <Gamepad2 className="w-8 h-8 text-blue-500" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
    link: "/sign-up",
    linkText: "Crear Cadete",
  },
  {
    id: 2,
    title: "Academia Espacial (Cursos)",
    description:
      "Módulos educativos para padres y terapeutas. Aprende estrategias de manejo conductual y entiende la ciencia detrás del desarrollo cognitivo de tus hijos.",
    icon: <GraduationCap className="w-8 h-8 text-purple-500" />,
    bg: "bg-purple-50",
    border: "border-purple-100",
    link: "/cursos",
    linkText: "Ver Cursos",
  },
  {
    id: 3,
    title: "Sala de Prácticas (Actividades)",
    description:
      "Catálogo de ejercicios físicos y manuales para hacer en casa o en el consultorio. Refuerza el aprendizaje digital con retos en el mundo real.",
    icon: <Beaker className="w-8 h-8 text-emerald-500" />,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    link: "/actividades",
    linkText: "Ver Catálogo",
  },
];

// ... (El arreglo const featuresData = [...] se queda exactamente igual) ...

export default function FeaturesGrid() {
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuresData.map((feature) => (
          <div
            key={feature.id}
            className={`rounded-3xl p-8 border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white group ${feature.border}`}
          >
            <div
              className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
            >
              {feature.icon}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">
              {feature.title}
            </h3>
            <p className="text-slate-500 mb-8 grow leading-relaxed">
              {feature.description}
            </p>

            {/* Si es la tarjeta de Juegos (ID 1), mostramos lógica de Auth */}
            <div className="mt-auto w-full">
              {feature.id === 1 ? (
                <>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-12 font-bold border-slate-200 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors"
                      >
                        Crear Cadete
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/select-profile" className="w-full block">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-12 font-bold border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
                      >
                        Jugar Ahora
                      </Button>
                    </Link>
                  </SignedIn>
                </>
              ) : (
                /* Si son los Cursos o Actividades, dejamos el link normal */
                <Link href={feature.link} className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-12 font-bold border-slate-200 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors"
                  >
                    {feature.linkText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
