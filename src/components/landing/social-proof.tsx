// src/components/landing/social-proof.tsx
import { Shield, Activity, BarChart3, BrainCircuit } from "lucide-react";

export default function SocialProof() {
  return (
    <section className="bg-slate-900 border-y border-slate-800 py-8 relative z-20">
      <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 opacity-80">
        <div className="flex items-center gap-2 font-bold text-slate-400">
          <Shield className="w-5 h-5 text-cyan-500" /> Entorno Seguro
        </div>
        <div className="flex items-center gap-2 font-bold text-slate-400">
          <Activity className="w-5 h-5 text-cyan-500" /> Basado en Evidencia
        </div>
        <div className="flex items-center gap-2 font-bold text-slate-400">
          <BarChart3 className="w-5 h-5 text-cyan-500" /> Analítica Clínica
        </div>
        <div className="flex items-center gap-2 font-bold text-slate-400">
          <BrainCircuit className="w-5 h-5 text-cyan-500" /> Desarrollo
          Cognitivo
        </div>
      </div>
    </section>
  );
}
