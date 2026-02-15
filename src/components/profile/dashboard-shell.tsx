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
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 justify-between">
          {!isCollapsed && (
            <span className="font-semibold text-lg truncate">My App</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          <ul className="grid gap-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground",
                      isActive
                        ? "bg-muted text-brand-mustard"
                        : "text-muted-foreground",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isActive && "text-brand-mustard",
                      )}
                    />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto px-2 pb-2">
            {/* Call to Action: Ver Progreso */}
            <Link
              href="/dashboard/progress"
              className={cn(
                "flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md mb-2",
                "bg-brand-mustard text-white hover:opacity-90",
                isCollapsed ? "px-0 w-10 h-10 mx-auto rounded-full" : "w-full",
              )}
              title="Ver Progreso"
            >
              <Trophy className={cn("h-5 w-5", isCollapsed ? "" : "mr-1")} />
              {!isCollapsed && <span>Ver Progreso</span>}
            </Link>

            {/* Secondary items: Ajustes / Ayuda */}
            <ul className="grid gap-1">
              <li>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground",
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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground",
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
        <div className="border-t border-sidebar-border p-4">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center",
            )}
          >
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium">Usuario</span>
                <span className="text-xs text-muted-foreground truncate">
                  user@example.com
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Structure */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="flex md:hidden h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <Sheet>
            <SheetTrigger asChild>
              <button className="outline-none">
                <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Mi Perfil</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Usuario</p>
                    <p className="text-sm text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </div>
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Ajustes</span>
                  </Link>
                  <Link
                    href="/dashboard/help"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Ayuda</span>
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-100 text-red-600 rounded-md transition-colors mt-2"
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-sidebar md:hidden px-2 pb-safe">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full gap-1"
              >
                <div
                  className={cn(
                    "p-1.5 rounded-full transition-colors",
                    isActive
                      ? "bg-brand-mustard text-white"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground",
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
