"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  Gamepad2,
  Settings,
  ArrowLeftRight,
} from "lucide-react";

export default function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const linkStyles = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${
      pathname === path
        ? "bg-cyan-50 text-cyan-600 shadow-sm"
        : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50/50"
    }`;

  return (
    <aside className="w-full md:w-72 h-full bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={onLinkClick}
        >
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-white font-black text-xl leading-none">
              N
            </span>
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 tracking-tight">
            NeuroPlay
          </span>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="p-4 space-y-2 grow">
        <Link
          href="/dashboard"
          className={linkStyles("/dashboard")}
          onClick={onLinkClick}
        >
          <Home className="w-5 h-5" />
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

        {/* 🔥 LA PUERTA DE TELETRANSPORTACIÓN (ADULTO) */}
        <div className="pb-2 border-b border-slate-100 mb-2">
          <Link
            href="/select-profile"
            className={linkStyles("/select-profile")}
            onClick={onLinkClick}
          >
            <ArrowLeftRight className="w-5 h-5" />
            Cambiar de Perfil
          </Link>
        </div>

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
          <Gamepad2 className="w-5 h-5" />
          Mis Actividades
        </Link>
      </nav>

      {/* Ajustes al final */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/dashboard/ajustes"
          className={linkStyles("/dashboard/ajustes")}
          onClick={onLinkClick}
        >
          <Settings className="w-5 h-5" />
          Ajustes
        </Link>
      </div>
    </aside>
  );
}
