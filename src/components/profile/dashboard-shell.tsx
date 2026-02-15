"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Puzzle,
  CheckCircle,
  Wrench,
  Menu,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  HelpCircle,
  LogOut,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Actividades",
    href: "/dashboard/activities",
    icon: Puzzle,
  },
  {
    title: "Checklists",
    href: "/dashboard/checklists",
    icon: CheckCircle,
  },
  {
    title: "Herramientas",
    href: "/dashboard/tools",
    icon: Wrench,
  },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathname = usePathname();

  // Determine current title for mobile top bar
  const currentItem = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
  const pageTitle = currentItem ? currentItem.title : "Dashboard";

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 relative",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Collapse Button */}
          <div className="absolute right-[-12px] top-6 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full border shadow-sm bg-background hover:bg-muted"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-3 w-3" />
              ) : (
                <PanelLeftClose className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Profile Section (Top) */}
          <div className={cn("p-6 pb-2 transition-all", isCollapsed && "px-2 py-4 flex justify-center")}>
             <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
               <Avatar className={cn("border-2 border-background shadow-sm", isCollapsed ? "h-10 w-10" : "h-12 w-12")}>
                 <AvatarImage src="/placeholder-avatar.jpg" alt="Niño/a" />
                 <AvatarFallback>N</AvatarFallback>
               </Avatar>
               {!isCollapsed && (
                 <div className="flex flex-col overflow-hidden">
                   <span className="text-base font-bold text-foreground leading-tight">Niño/a</span>
                   <span className="text-xs text-muted-foreground truncate">Perfil del niño/a</span>
                 </div>
               )}
             </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
            <ul className="grid gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? "bg-brand-amber-light text-brand-mustard shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        isCollapsed && "justify-center px-2 py-3",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-brand-mustard" : "text-muted-foreground group-hover:text-foreground"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto pt-4 border-t border-border/50">
               {/* Call to Action: Ver Progreso */}
              <Link
                href="/dashboard/progress"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-6",
                  "bg-brand-mustard text-white",
                  isCollapsed ? "px-0 w-10 h-10 mx-auto rounded-full" : "w-full",
                )}
                title="Ver Progreso"
              >
                <Trophy className={cn("h-5 w-5", isCollapsed ? "" : "mr-1")} strokeWidth={2.5} />
                {!isCollapsed && <span>Ver Progreso</span>}
              </Link>

              {/* Secondary items: Ajustes / Ayuda */}
              <ul className="grid gap-1">
                <li>
                  <Link
                    href="/dashboard/settings"
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    {!isCollapsed && <span>Ajustes</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/help"
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    <HelpCircle className="h-5 w-5" />
                    {!isCollapsed && <span>Ayuda</span>}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Structure */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="flex md:hidden h-16 items-center justify-between bg-white shadow-sm px-4 sticky top-0 z-50">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
          <Sheet>
            <SheetTrigger asChild>
              <button className="outline-none rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-9 w-9 border border-border shadow-sm">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Niño/a" />
                  <AvatarFallback className="bg-brand-amber-light text-brand-mustard font-bold">N</AvatarFallback>
                </Avatar>
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Mi Perfil</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Niño/a" />
                    <AvatarFallback className="bg-brand-amber-light text-brand-mustard font-bold text-lg">N</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">Niño/a</p>
                    <p className="text-sm text-muted-foreground">
                      Perfil del niño/a
                    </p>
                  </div>
                </div>
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-xl transition-colors font-medium"
                  >
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span>Ajustes</span>
                  </Link>
                  <Link
                    href="/dashboard/help"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-xl transition-colors font-medium"
                  >
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span>Ayuda</span>
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors mt-2 font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar sesión</span>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around rounded-t-3xl border-t bg-white shadow-[0_-5px_10px_rgba(0,0,0,0.02)] md:hidden px-4 pb-safe">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-200",
                  isActive ? "-translate-y-1" : ""
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-2xl transition-all duration-300",
                    isActive
                      ? "bg-brand-amber-light text-brand-mustard shadow-sm"
                      : "text-muted-foreground bg-transparent",
                  )}
                >
                  <item.icon className={cn("h-6 w-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold tracking-tight",
                    isActive ? "text-brand-mustard" : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
