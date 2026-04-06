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
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  ClerkLoading, // 🔥 NUEVO
  ClerkLoaded,
} from "@clerk/nextjs";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-cyan-400">
            Neuro Espacial
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold flex items-center gap-2 transition-colors hover:text-cyan-400 ${
                  isActive ? "text-cyan-400" : "text-slate-300"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
          <div className="flex items-center gap-4 border-l border-slate-700 pl-8 h-10">
            {/* 🔥 ESTADO DE CARGA DE CLERK */}
            <ClerkLoading>
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-slate-800 animate-pulse rounded"></div>
                <div className="h-10 w-32 bg-slate-800 animate-pulse rounded-xl"></div>
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-bold text-slate-300 hover:text-white transition-colors hover:cursor-pointer">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white border-0 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105">
                    Empezar Gratis
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800 font-bold gap-2 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Mi Panel
                  </Button>
                </Link>
                <div className="ml-2 w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center bg-slate-800 hover:scale-110 transition-transform">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </nav>

        <div className="md:hidden flex items-center gap-4">
          <ClerkLoading>
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse"></div>
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center bg-slate-800">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </ClerkLoaded>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-slate-900 border-l border-slate-800 p-0 w-80 flex flex-col"
            >
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>

              {/* Cabecera Móvil */}
              <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-lg tracking-tight text-white">
                    Neuro<span className="text-cyan-400">Espacial</span>
                  </span>
                </Link>
              </div>
              <nav className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-xs font-black tracking-widest text-slate-500 uppercase mb-4">
                    Explorar
                  </p>
                  {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                          isActive
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div
                          className={
                            isActive ? "text-cyan-400" : "text-slate-500"
                          }
                        >
                          {link.icon}
                        </div>
                        <span className="font-bold">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <SignedIn>
                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <p className="text-xs font-black tracking-widest text-slate-500 uppercase mb-4">
                      Mi Cuenta
                    </p>
                    <Link
                      href="/select-profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <LayoutDashboard className="w-5 h-5 text-slate-500" />
                      <span className="font-bold">Ir a mi Panel</span>
                    </Link>
                  </div>
                </SignedIn>
              </nav>
              <div className="p-6 border-t border-slate-800 bg-slate-950/50">
                <SignedOut>
                  <div className="flex flex-col gap-3">
                    <SignInButton mode="modal">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-slate-700 bg-slate-900 text-white hover:bg-slate-800 h-12 font-bold "
                      >
                        Iniciar Sesión
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white border-0 shadow-lg shadow-cyan-500/20 h-12 font-bold">
                        Empezar Gratis
                      </Button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
