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

        {/* Menú Móvil */}
        <div className="md:hidden flex items-center gap-3">
          {userId && <UserButton afterSignOutUrl="/" />}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Abrir menú"
                className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-slate-900 border-slate-800 text-slate-100 p-6"
            >
              <SheetTitle className="text-cyan-400 font-black text-xl">
                Neuro Espacial
              </SheetTitle>

              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname.startsWith(link.href) ? "bg-slate-800 text-cyan-400" : "text-slate-300 hover:bg-slate-800 hover:text-cyan-400"}`}
                  >
                    {link.icon} {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col gap-3">
                {!userId ? (
                  <>
                    <SignInButton mode="modal">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full px-4 py-3 rounded-xl font-bold text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
                      >
                        Iniciar Sesión
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white py-6"
                      >
                        Empezar Gratis
                      </Button>
                    </SignUpButton>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Mi Panel
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
