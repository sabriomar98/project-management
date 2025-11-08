// components/sidebar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard,TrashIcon, FolderKanban, Calendar, BarChart3, Settings, Users, Building2, Bell, Tag, ChevronLeft, ChevronRight } from "lucide-react"

type SidebarProps = { className?: string }

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Tasks", href: "/dashboard/tasks", icon: TrashIcon },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Teams", href: "/dashboard/teams", icon: Users },
  { name: "Organizations", href: "/dashboard/organizations", icon: Building2 },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Labels", href: "/dashboard/labels", icon: Tag },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const v = localStorage.getItem("sidebar:collapsed")
    if (v !== null) setCollapsed(v === "1")
  }, [])
  React.useEffect(() => {
    localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0")
  }, [collapsed])

  const sidebarWidth = collapsed ? "w-16" : "w-64"

  const NavItem: React.FC<{
    name: string
    href: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }> = ({ name, href, icon: Icon }) => {
    const isActive =
      pathname === href ||
      (href !== "/dashboard" && new RegExp(`^${href}(/|$)`).test(pathname))

    return (
      <li>
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className={cn("h-5 w-5 shrink-0", isActive && "scale-105")} />
          <span
            className={cn(
              "whitespace-nowrap transition-[opacity,transform,width] duration-200",
              collapsed ? "opacity-0 -translate-x-2 w-0 overflow-hidden" : "opacity-100 translate-x-0"
            )}
          >
            {name}
          </span>

          {collapsed && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-full top-1/2 -translate-y-1/2",
                "ml-2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md",
                "opacity-0 transition-opacity duration-150",
                "group-hover:opacity-100"
              )}
            >
              {name}
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <aside
      className={cn(
        // key bits: sticky + full viewport height + allow own internal scroll if needed
        "hidden border-r bg-background lg:block sticky top-0 h-dvh",
        "transition-[width] duration-300 ease-in-out",
        "overflow-y-auto", // if sidebar content ever gets taller than the viewport
        sidebarWidth,
        className
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-3">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
              P
            </div>
            <span
              className={cn(
                "text-xl font-extrabold tracking-tight",
                "transition-[opacity,transform,width] duration-200",
                collapsed ? "opacity-0 -translate-x-2 w-0 overflow-hidden" : "opacity-100 translate-x-0"
              )}
            >
              ProjectHub
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-1.5">
            {navigation.map((item) => (
              <NavItem key={item.name} {...item} />
            ))}
          </ul>
        </nav>

        <div className="border-t p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
