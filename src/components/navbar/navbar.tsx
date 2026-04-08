"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Rocket, BookOpen, Beaker, LayoutDashboard } from "lucide-react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

// 🔥 Recibimos el userId directamente desde el servidor
export default function Navbar({ userId }: { userId: string | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Cursos", href: "/cursos", icon: <BookOpen className="w-4 h-4" /> },
    {
      name: "Actividades",
      href: "/actividades",
      icon: <Beaker className="w-4 h-4" />,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-sm py-3" : "bg-transparent py-5"}`}
    >
      <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between">
        {/* Logo... */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-cyan-400">
            Neuro Espacial
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {/* Links... */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-bold flex items-center gap-2 transition-colors ${pathname.startsWith(link.href) ? "text-cyan-400" : "text-slate-300 hover:text-cyan-400"}`}
            >
              {link.icon} {link.name}
            </Link>
          ))}

          <div className="flex items-center gap-4 border-l border-slate-700 pl-8 h-10">
            {/* 🔥 EVALUACIÓN INSTANTÁNEA BASADA EN LA PROP DEL SERVIDOR 🔥 */}
            {!userId ? (
              // Vista Deslogueado (Se pinta inmediatamente)
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white border-0 shadow-lg shadow-cyan-500/20">
                    Empezar Gratis
                  </Button>
                </SignUpButton>
              </>
            ) : (
              // Vista Logueado (Se pinta inmediatamente)
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800 font-bold gap-2 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Mi Panel
                  </Button>
                </Link>
                <div className="ml-2 w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center bg-slate-800">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </>
            )}
          </div>
        </nav>

        {/* ... Lógica idéntica para el Menú Móvil usando !userId o userId ... */}
      </div>
    </header>
  );
}
