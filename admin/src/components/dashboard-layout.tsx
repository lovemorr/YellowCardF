"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"

export function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background dark:bg-slate-950">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border dark:border-slate-800/50 bg-background/80 dark:bg-slate-950/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-9 w-9 rounded-lg bg-muted dark:bg-slate-800/50 text-muted-foreground dark:text-slate-400 hover:bg-accent dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-white transition-all">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div className="h-6 w-px bg-border dark:bg-slate-800" />
            <h1 className="text-lg font-semibold tracking-tight text-foreground dark:text-white">{title}</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6 bg-muted/30 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
