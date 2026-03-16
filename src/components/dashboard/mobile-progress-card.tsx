// src/components/dashboard/mobile-progress-card.tsx
import { Zap, Users, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AccountSummaryProps {
  totalEnergy: number;
  totalKids: number;
}

export default function MobileProgressCard({
  totalEnergy,
  totalKids,
}: AccountSummaryProps) {
  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700 w-full animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Fondo decorativo */}
      <div className="absolute -top-12 -right-12 text-slate-700/30">
        <Zap className="w-48 h-48" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Estadísticas */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">
              Energía Total de la Flota
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
              <span className="text-4xl font-black text-white">
                {totalEnergy}
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-12 bg-slate-700"></div>

          <div className="hidden sm:block">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">
              Cadetes Activos
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-3xl font-black text-white">
                {totalKids}
              </span>
            </div>
          </div>
        </div>

        {/* Llamado a la Acción */}
        <Link href="/dashboard/add-cadet">
          <Button className="w-full md:w-auto rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold h-12 px-6 shadow-lg shadow-cyan-500/20">
            <Plus className="w-5 h-5 mr-2" /> Añadir Cadete
          </Button>
        </Link>
      </div>
    </div>
  );
}
