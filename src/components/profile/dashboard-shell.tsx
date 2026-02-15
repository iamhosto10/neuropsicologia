"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Puzzle,
  CheckCircle,
  Wrench,
  Menu,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardShellProps {
  children: React.ReactNode
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
]

export function DashboardShell({ children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const pathname = usePathname()

  // Determine current title for mobile top bar
  const currentItem = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const pageTitle = currentItem ? currentItem.title : "Dashboard"

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center border-b border-[var(--sidebar-border)] px-4 justify-between">
            {!isCollapsed && <span className="font-semibold text-lg truncate">My App</span>}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="grid gap-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground",
                      isActive
                        ? "bg-muted text-[var(--brand-mustard)]"
                        : "text-muted-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-[var(--brand-mustard)]")} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="border-t border-[var(--sidebar-border)] p-4">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-medium">Usuario</span>
                        <span className="text-xs text-muted-foreground truncate">user@example.com</span>
                    </div>
                )}
            </div>
        </div>
      </aside>

      {/* Mobile Structure */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="flex md:hidden h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-[var(--sidebar)] md:hidden px-2 pb-safe">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center w-full h-full gap-1"
                >
                  <div className={cn(
                      "p-1.5 rounded-full transition-colors",
                      isActive ? "bg-[var(--brand-mustard)] text-white" : "text-muted-foreground"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.title}
                  </span>
                </Link>
              )
            })}
        </nav>
      </div>
    </div>
  )
}
