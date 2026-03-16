import { BrainCircuit } from "lucide-react";
import LandingHero from "@/components/landing/landing-hero";
import SocialProof from "@/components/landing/social-proof";
import DualApproach from "@/components/landing/dual-approach";
import FinalCta from "@/components/landing/final-cta";
import FeaturesGrid from "@/components/landing/features-grid";
import ToolsSection from "@/components/landing/tools-section";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <LandingHero />
      <SocialProof />
      <DualApproach />

      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="text-center mb-4 px-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Un Ecosistema Completo
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Más que solo juegos, ofrecemos las herramientas teóricas y prácticas
            para un desarrollo integral.
          </p>
        </div>
        <FeaturesGrid />
      </section>

      <section className="py-24 bg-white">
        <div className="text-center mb-16 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-6">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Módulos Terapéuticos Activos
          </h2>
          <p className="text-xl text-slate-500">
            Cada misión interactiva está diseñada bajo estrictos principios
            neuropsicológicos para estimular funciones ejecutivas específicas.
          </p>
        </div>
        <ToolsSection />
      </section>
      <FinalCta />
    </main>
  );
}
