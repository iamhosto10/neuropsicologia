"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Beaker,
  Settings,
  Rocket,
} from "lucide-react";

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const { openUserProfile } = useClerk();

  // Función para evaluar si el link es la ruta actual
  const isActive = (path: string) => pathname === path;

  // Clases dinámicas de Tailwind
  const linkStyles = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold
    ${
      isActive(path)
        ? "bg-cyan-50 text-cyan-600 shadow-sm border border-cyan-100"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
    }
  `;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* LOGO */}
      <div className="p-6 mb-4">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={onLinkClick}
        >
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">
            Neuro<span className="text-cyan-500">Espacial</span>
          </span>
        </Link>
      </div>

      {/* ENLACES DE NAVEGACIÓN */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2">
          Principal
        </p>

        <Link
          href="/dashboard"
          className={linkStyles("/dashboard")}
          onClick={onLinkClick}
        >
          <LayoutDashboard className="w-5 h-5" />
          Panel Principal
        </Link>

        <Link
          href="/dashboard/pacientes"
          className={linkStyles("/dashboard/pacientes")}
          onClick={onLinkClick}
        >
          <Users className="w-5 h-5" />
          Pacientes / Cadetes
        </Link>

        <div className="pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2">
            Contenido
          </p>
          <Link
            href="/dashboard/cursos"
            className={linkStyles("/dashboard/cursos")}
            onClick={onLinkClick}
          >
            <BookOpen className="w-5 h-5" />
            Mis Cursos
          </Link>
          <Link
            href="/dashboard/actividades"
            className={linkStyles("/dashboard/actividades")}
            onClick={onLinkClick}
          >
            <Beaker className="w-5 h-5" />
            Mis Actividades
          </Link>
        </div>
      </nav>

      {/* BOTÓN DE CONFIGURACIÓN (CLERK) */}
      <div className="p-4 mt-auto border-t border-slate-100">
        <button
          onClick={() => {
            openUserProfile();
            if (onLinkClick) onLinkClick();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-left"
        >
          <Settings className="w-5 h-5" />
          Configuración
        </button>
      </div>
    </div>
  );
}
