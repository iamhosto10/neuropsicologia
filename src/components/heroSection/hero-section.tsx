import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full bg-[#F9FAFB] py-20 lg:min-h-[85vh] flex items-center">
      <div className="container mx-auto px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-black leading-tight">
              Actividades para el desarrollo{" "}
              <span className="text-[var(--neuro-green)]">infantil y juvenil</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600">
              Recursos y herramientas para el desarrollo de tus hijos, desde la
              primera infancia hasta la adolescencia.
            </p>
            <Button
              className="mt-8 rounded-full bg-[var(--neuro-green)] text-black font-bold hover:bg-green-600"
              size="lg"
            >
              Explorar Actividades
            </Button>
          </div>

          {/* Illustration Placeholder */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="w-full max-w-md aspect-square bg-[#FEF3C7] rounded-3xl flex items-center justify-center">
              <HeartHandshake className="w-1/2 h-1/2 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
