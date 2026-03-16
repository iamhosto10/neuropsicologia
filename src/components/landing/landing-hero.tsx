// src/components/landing/landing-hero.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Rocket } from "lucide-react";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"; // 🔥 IMPORTAMOS CLERK

export default function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full font-bold text-sm mb-8 border border-cyan-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Star className="w-4 h-4 fill-cyan-400" /> Nueva Metodología
          Neuro-Espacial
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight max-w-5xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Terapia neuropsicológica que los niños{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
            realmente quieren hacer
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          Convierte el entrenamiento cognitivo para TDAH y TEA en una aventura
          espacial. Mientras ellos salvan la galaxia, tú mides su progreso
          clínico en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          {/* 🔥 SI NO HA INICIADO SESIÓN: Muestra el Modal de Registro */}
          <SignedOut>
            <SignUpButton mode="modal">
              <Button className="rounded-2xl h-14 px-8 font-black bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_40px_rgba(6,182,212,0.3)] text-lg w-full sm:w-auto hover:scale-105 transition-all">
                Crear Perfil Gratis <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </SignUpButton>
          </SignedOut>

          {/* 🔥 SI YA INICIÓ SESIÓN: Lo mandamos a su Panel de Control */}
          <SignedIn>
            <Link href="/select-profile" className="w-full sm:w-auto">
              <Button className="rounded-2xl h-14 px-8 font-black bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] text-lg w-full sm:w-auto hover:scale-105 transition-all">
                Ir al Cuartel General <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </SignedIn>

          <Link href="#como-funciona" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="rounded-2xl h-14 px-8 font-bold text-black border-slate-700 hover:bg-slate-800 text-lg w-full sm:w-auto transition-colors"
            >
              Descubrir cómo funciona
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
