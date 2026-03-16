// src/components/landing/final-cta.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function FinalCta() {
  return (
    <section className="py-24 md:py-32 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-400 via-slate-900 to-slate-950" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-8 animate-bounce" />
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
          ¿Listo para iniciar la misión?
        </h2>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          Únete a nuestra plataforma hoy y transforma el entrenamiento cognitivo
          de tu paciente o hijo en una aventura inolvidable.
        </p>

        <SignedOut>
          <SignUpButton mode="modal">
            <Button className="rounded-2xl h-16 px-10 font-black bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_50px_rgba(6,182,212,0.4)] text-xl hover:scale-105 transition-all">
              Crear Cuenta de Comandante
            </Button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <Link href="/select-profile">
            <Button className="rounded-2xl h-16 px-10 font-black bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_50px_rgba(59,130,246,0.4)] text-xl hover:scale-105 transition-all">
              Volver a tu Panel de Control
            </Button>
          </Link>
        </SignedIn>
      </div>
    </section>
  );
}
