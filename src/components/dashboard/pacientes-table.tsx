// src/components/dashboard/pacientes-table.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAvatarIcon } from "@/lib/utils";
import { deleteKidProfile } from "@/app/actions/profile.actions";

interface KidData {
  _id: string;
  alias: string;
  activeAvatar: string;
  energyCrystals: number;
  totalSessions: number;
  lastAccess: string | null;
}

export default function PacientesTable({
  initialKids,
}: {
  initialKids: KidData[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Filtrado en tiempo real
  const filteredKids = initialKids.filter((kid) =>
    kid.alias.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Función para eliminar con confirmación
  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `¿Alerta Roja! ¿Estás seguro de que deseas eliminar permanentemente al cadete ${name}? Todo su progreso clínico se perderá.`,
      )
    ) {
      setDeletingId(id);
      startTransition(async () => {
        await deleteKidProfile(id);
        setDeletingId(null);
        router.refresh();
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles Superiores */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar cadete por nombre..."
            className="pl-10 h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-cyan-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/dashboard/add-cadet">
          <Button className="w-full sm:w-auto rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 px-6 shadow-md shadow-cyan-900/20">
            <Plus className="w-5 h-5 mr-2" /> Añadir Nuevo Cadete
          </Button>
        </Link>
      </div>

      {/* Tabla del CRM */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 md:p-6 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Cadete
                </th>
                <th className="p-4 md:p-6 text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">
                  Energía
                </th>
                <th className="p-4 md:p-6 text-xs font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">
                  Compromiso
                </th>
                <th className="p-4 md:p-6 text-xs font-black text-slate-500 uppercase tracking-widest hidden lg:table-cell">
                  Última Misión
                </th>
                <th className="p-4 md:p-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKids.length > 0 ? (
                filteredKids.map((kid) => (
                  <tr
                    key={kid._id}
                    className={`transition-colors group ${deletingId === kid._id ? "bg-red-50 opacity-50" : "hover:bg-slate-50/50"}`}
                  >
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl border border-slate-200">
                          {getAvatarIcon(kid.activeAvatar)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {kid.alias}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            ID: {kid._id.split("-").pop()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 hidden sm:table-cell">
                      <div className="flex items-center gap-2 font-bold text-yellow-600">
                        ⚡ {kid.energyCrystals}
                      </div>
                    </td>
                    <td className="p-4 md:p-6 hidden md:table-cell">
                      <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold border border-cyan-100">
                        {kid.totalSessions} Sesiones jugadas
                      </span>
                    </td>
                    <td className="p-4 md:p-6 hidden lg:table-cell">
                      {kid.lastAccess ? (
                        <span className="text-sm font-medium text-slate-600">
                          {new Date(kid.lastAccess).toLocaleDateString(
                            "es-ES",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-amber-500 flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4" /> Sin iniciar
                        </span>
                      )}
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/kid/${kid._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                            disabled={isPending}
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </Link>
                        {/* 🔥 Botón Editar redirige a la nueva ruta */}
                        <Link href={`/dashboard/kid/${kid._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            disabled={isPending}
                          >
                            <Edit2 className="w-5 h-5" />
                          </Button>
                        </Link>
                        {/* 🔥 Botón Eliminar ejecuta la acción */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(kid._id, kid.alias)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          disabled={isPending}
                        >
                          {deletingId === kid._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    No se encontraron cadetes con ese nombre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
