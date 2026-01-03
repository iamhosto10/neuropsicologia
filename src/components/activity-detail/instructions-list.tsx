import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, Hand, ListOrdered, Smile } from "lucide-react";

const steps = [
  {
    icon: Eye,
    title: "Observa las cartas",
    description:
      "Mira atentamente todas las cartas que están sobre la mesa boca arriba.",
  },
  {
    icon: Hand,
    title: "Toca dos cartas",
    description:
      "Selecciona dos cartas para intentar encontrar una pareja coincidente.",
  },
  {
    icon: Smile,
    title: "¡Celebra!",
    description:
      "Si las cartas son iguales, déjalas boca arriba y gana un punto.",
  },
];

export function InstructionsList() {
  return (
    <div className="container p-6 lg:mx-auto lg:max-w-5xl">
      <Card
        className={cn(
          "w-full bg-[oklch(var(--brand-amber-light))] rounded-[2rem] p-6 md:p-10 border border-amber-100",
          "animate-in slide-in-from-bottom-6 fade-in duration-700"
        )}
      >
        <div className="flex flex-row items-center gap-4">
          <ListOrdered className="h-8 w-8 text-[oklch(var(--brand-mustard))]" />
          <h2 className="text-2xl font-extrabold text-black">
            Instrucciones Paso a Paso
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-8 relative">
          <div className="w-0.5 bg-amber-200/60 absolute top-4 bottom-4 left-[1.15rem]" />
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                "flex flex-row gap-6 relative z-10 animate-in slide-in-from-bottom-4 fade-in"
              )}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div
                className={cn(
                  "shrink-0 h-10 w-10 rounded-full bg-white border-4 border-[oklch(var(--brand-mustard))] flex items-center justify-center shadow-sm"
                )}
              >
                <step.icon className="h-5 w-5 text-black" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-black">{step.title}</h3>
                <p className="text-stone-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
