"use client"

import { LayoutGrid, FileStack, FilePlus2, Users2, LogOut, Zap, Package } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logout } from "@/lib/api"
import { useRouter } from "next/navigation"

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutGrid },
  { title: "Policies", url: "/policies", icon: FileStack },
  { title: "Add Policy", url: "/policies/new", icon: FilePlus2 },
  { title: "Export QR", url: "/policies/export", icon: Package },
  { title: "Users", url: "/users", icon: Users2 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-card dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Zap className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-blue-400/20 animate-pulse" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-base font-bold tracking-tight text-foreground dark:text-white">
              e<span className="text-blue-500">-</span>YC
            </span>
            <span className="text-[10px] font-medium text-muted-foreground dark:text-slate-400">Admin Console</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        h-11 rounded-xl transition-all duration-200 
                        hover:bg-accent dark:hover:bg-slate-800/80 hover:shadow-lg
                        data-[active=true]:bg-blue-500/10 dark:data-[active=true]:bg-gradient-to-r dark:data-[active=true]:from-blue-600/20 dark:data-[active=true]:to-indigo-600/20
                        data-[active=true]:border data-[active=true]:border-blue-500/30
                        data-[active=true]:shadow-lg data-[active=true]:shadow-blue-500/10
                        group
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <div className={`
                          flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                            : 'bg-muted dark:bg-slate-800/50 text-muted-foreground dark:text-slate-400 group-hover:bg-accent dark:group-hover:bg-slate-700/50 group-hover:text-foreground dark:group-hover:text-slate-300'
                          }
                        `}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className={`font-medium transition-colors ${isActive ? 'text-foreground dark:text-white' : 'text-muted-foreground dark:text-slate-300'}`}>
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3">
        <div className="rounded-xl bg-muted dark:bg-slate-800/50 p-3 mb-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground dark:text-white truncate">Admin</p>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Logged in</p>
            </div>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-11 rounded-xl text-muted-foreground dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted dark:bg-slate-800/50">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
