// app/(dashboard)/layout.tsx (your file)
import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/signin")

  return (
    // Use a fixed-height viewport container and prevent the page from scrolling
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar is sticky and full height */}
      <DashboardSidebar className="sticky top-0 h-dvh" />

      {/* Right column scrolls, not the page */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
