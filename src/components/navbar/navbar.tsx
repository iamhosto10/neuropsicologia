"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/actividades", label: "Actividades" },
  { href: "#", label: "Cursos" },
  { href: "#", label: "Recursos" },
  { href: "#", label: "Sobre Nosotros" },
  { href: "#", label: "Contacto" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = usePathname();
  console.log("Current route:", router);

  return (
    <header className="fixed top-6 left-0 right-0 mx-auto w-[90%] max-w-5xl rounded-full border shadow-lg bg-white z-50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Layers className="h-6 w-6" style={{ color: "var(--neuro-green)" }} />
          <span className="font-bold text-black text-lg tracking-tight">
            NeuroCrece
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium text-gray-700 hover:text-black transition-colors",
                router === link.href && "text-black font-bold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full bg-gray-100 font-bold"
          >
            Login
          </Button>
          <Button
            className="rounded-full text-black font-bold"
            style={{ backgroundColor: "var(--neuro-green)" }}
          >
            Register
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="hover:cursor-pointer"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Layers
                    className="h-6 w-6"
                    style={{ color: "var(--neuro-green)" }}
                  />
                  <span className="font-bold text-black text-lg tracking-tight">
                    NeuroCrece
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-6 px-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-4 mt-4">
                  <Button
                    variant="ghost"
                    className="rounded-full bg-gray-100 font-bold w-full"
                  >
                    Login
                  </Button>
                  <Button
                    className="rounded-full text-black font-bold w-full"
                    style={{ backgroundColor: "var(--neuro-green)" }}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
