import { Card } from '@/components/ui/card';
import { Circle, Eye, Smile } from 'lucide-react';

const steps = [
  {
    number: "1",
    icon: <Circle className="h-8 w-8 text-gray-400" />,
    title: "El Círculo",
    description: "La base de nuestra cara.",
  },
  {
    number: "2",
    icon: <Eye className="h-8 w-8 text-gray-400" />,
    title: "Los Ojos",
    description: "Añaden vida y expresión.",
  },
  {
    number: "3",
    icon: <Smile className="h-8 w-8 text-gray-400" />,
    title: "La Sonrisa",
    description: "El toque final de alegría.",
  },
];

export function DrawingSteps() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Tres Pasos para Empezar
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Card key={step.number} className="bg-white border-gray-100 rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-[oklch(var(--creative-amber))] flex items-center justify-center text-amber-600 font-bold text-xl">
              {step.number}
            </div>
            {step.icon}
            <div className="mt-2">
              <h3 className="font-bold text-gray-800">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
