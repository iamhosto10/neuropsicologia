import {
  BrainCircuit,
  ClipboardList,
  Puzzle,
  HeartHandshake,
  Speech,
} from "lucide-react";
import { Button } from "../ui/button";

const toolsData = [
  {
    title: "Herramientas de Autorregulación",
    description:
      "Estrategias para mantener la calma y gestionar las emociones de manera efectiva.",
    color: "bg-blue-100",
    icon: <BrainCircuit size={48} className="text-blue-500" />,
  },
  {
    title: "Rutinas Visuales",
    description:
      "Apoyos visuales para estructurar el día a día, anticipar eventos y reducir la ansiedad.",
    color: "bg-green-100",
    icon: <ClipboardList size={48} className="text-green-500" />,
  },
  {
    title: "Juegos de Estimulación Cognitiva",
    description:
      "Actividades lúdicas diseñadas para fortalecer la atención, memoria y funciones ejecutivas.",
    color: "bg-yellow-100",
    icon: <Puzzle size={48} className="text-yellow-500" />,
  },
  {
    title: "Habilidades Sociales",
    description:
      "Técnicas y prácticas para mejorar la interacción, comunicación y comprensión social.",
    color: "bg-pink-100",
    icon: <HeartHandshake size={48} className="text-pink-500" />,
  },
  {
    title: "Comunicación Aumentativa",
    description:
      "Sistemas alternativos para facilitar la expresión de necesidades, ideas y sentimientos.",
    color: "bg-purple-100",
    icon: <Speech size={48} className="text-purple-500" />,
  },
];

export function ToolsSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50 w-full max-w-5xl mx-auto">
      <div className="container mx-auto px-6 lg:px-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Herramientas para el día a día
        </h2>

        {/* Responsive Container */}
        <div className="flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory py-4 overflow-scroll ">
          {toolsData.map((tool) => (
            <div
              key={tool.title}
              // Card sizing for "peekaboo" effect on mobile/tablet
              className="min-w-[80%] md:min-w-[45%] lg:min-w-[30%] snap-start
                         bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Image Area */}
              <div
                className={`h-48 w-full flex items-center justify-center ${tool.color}`}
              >
                {tool.icon}
              </div>

              {/* Body Area */}
              <div className="p-6 flex flex-col items-start gap-3 grow">
                <h3 className="font-bold text-lg text-gray-900">
                  {tool.title}
                </h3>
                <p className="text-gray-500 text-sm grow">{tool.description}</p>
                <Button
                  variant="soft"
                  className="mt-4 self-start px-6 py-2 text-sm transition-colors"
                >
                  Saber más
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
