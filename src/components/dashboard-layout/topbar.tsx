// src/components/dashboard-layout/topbar.tsx
"use client";

import { useState } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Sidebar from "./sidebar";

export default function Topbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        {/* MENÚ MÓVIL (Off-Canvas) */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-500"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetTitle className="sr-only">Navegación</SheetTitle>
            {/* Llamamos al Sidebar y le pasamos la orden de cerrar al hacer clic */}
            <Sidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* BARRA DE BÚSQUEDA (Desktop) */}
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar paciente o curso..."
            className="pl-10 bg-slate-50 border-none rounded-xl focus-visible:ring-cyan-500"
          />
        </div>
      </div>

      {/* CONTROLES DE LA DERECHA */}
      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 text-slate-400 hover:text-cyan-500 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900">Comandante</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Especialista
            </p>
          </div>
          {/* AVATAR REAL DE CLERK */}
          <div className="w-10 h-10 rounded-xl border-2 border-cyan-100 flex items-center justify-center bg-slate-50 overflow-hidden shadow-sm">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
}
