import { Rocket, BarChart3, CheckCircle2 } from "lucide-react";

export default function DualApproach() {
  return (
    <section
      id="como-funciona"
      className="py-24 md:py-32 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Diseñado para dos mundos
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Una experiencia integral que resuelve la falta de motivación del
            niño y la necesidad de datos precisos del terapeuta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Tarjeta: Mundo Cadete */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-700 hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute -top-10 -right-10 p-8 opacity-5 rotate-12">
              <Rocket className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-blue-500/20">
                Para el Niño (El Cadete)
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                Un Universo de
                <br />
                Misiones
              </h3>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                No más "tarea aburrida". El cadete entra a un Cuartel General
                donde cada ejercicio cognitivo es una misión vital para salvar
                satélites o limpiar asteroides.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-3 font-medium text-slate-200 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />{" "}
                  Recompensas y Cristales de Energía
                </li>
                <li className="flex items-center gap-3 font-medium text-slate-200 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />{" "}
                  Avatares personalizables
                </li>
                <li className="flex items-center gap-3 font-medium text-slate-200 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />{" "}
                  Cero frustración, 100% gamificado
                </li>
              </ul>
            </div>
          </div>

          {/* Tarjeta: Mundo Comandante */}
          <div className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-[2.5rem] p-8 md:p-12 text-slate-900 shadow-xl border border-cyan-100 relative overflow-hidden hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute -bottom-10 -right-10 p-8 opacity-5 -rotate-12">
              <BarChart3 className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-700 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-cyan-200">
                Para el Adulto (El Comandante)
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                Control y Analítica
                <br />
                Clínica
              </h3>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                Mientras ellos juegan, el sistema captura telemetría exacta.
                Monitorea la atención sostenida, memoria de trabajo y tiempos de
                reacción.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-3 font-medium text-slate-700 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />{" "}
                  Gráficas de precisión y constancia
                </li>
                <li className="flex items-center gap-3 font-medium text-slate-700 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />{" "}
                  Asignación remota de misiones
                </li>
                <li className="flex items-center gap-3 font-medium text-slate-700 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />{" "}
                  Historial clínico para informes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
