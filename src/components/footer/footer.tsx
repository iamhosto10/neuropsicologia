// src/components/footer/footer.tsx
import Link from "next/link";
import { Rocket, Heart, Mail, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedOut, SignUpButton } from "@clerk/nextjs";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-8 border-t border-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="space-y-6">
            <Link href="/" className="items-center gap-2 group inline-flex">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Rocket className="w-6 h-6 text-white group-hover:-translate-y-1 transition-transform" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                Neuro<span className="text-cyan-400">Espacial</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm pr-4">
              Transformando la terapia neuropsicológica infantil en una aventura
              espacial. Motivación para ellos, datos clínicos para ti.
            </p>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-3 hover:text-cyan-400 transition-colors cursor-pointer">
                <Mail className="w-4 h-4 text-slate-500" />{" "}
                hola@neuroespacial.com
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500" /> Base de
                Operaciones, Tierra
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-lg mb-6 tracking-wide">
              Ecosistema
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/cursos"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Academia (Cursos)
                </Link>
              </li>
              <li>
                <Link
                  href="/actividades"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Laboratorio (Actividades)
                </Link>
              </li>
              <li>
                <Link
                  href="/select-profile"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Panel de Control
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-lg mb-6 tracking-wide">
              Soporte
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Metodología Clínica
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />{" "}
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <SignedOut>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <h4 className="text-white font-black text-lg mb-3">
                  ¿Listo para el despegue?
                </h4>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Crea tu cuenta de comandante hoy mismo y transforma el
                  aprendizaje de tus cadetes.
                </p>
                <SignUpButton mode="modal">
                  <Button className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">
                    Empezar Misión Gratis
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>

            <div className="hidden lg:block">
              {/* Espaciador visual para mantener la grilla cuando SignedOut no se renderiza */}
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR (Copyright) */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
          <p className="text-slate-500">
            &copy; {currentYear} NeuroEspacial. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-2 text-slate-500">
            Construido con{" "}
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />{" "}
            para mentes extraordinarias.
          </p>
        </div>
      </div>
    </footer>
  );
}
