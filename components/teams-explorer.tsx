"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format, isSameMonth } from "date-fns"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Grid2X2, List, Search, ArrowUpAZ, ArrowDownAZ, CalendarPlus } from "lucide-react"

type Member = {
  id: string
  name: string
  email: string
  image: string
  createdAt: string // ISO
}

type SortKey = "name-asc" | "name-desc" | "newest" | "oldest"
type ViewMode = "grid" | "list"

function usePersistentState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(() => {
    if (typeof window === "undefined") return initial
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : initial
  })
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)) } catch { }
  }, [key, state])
  return [state, setState]
}

export default function TeamsExplorer({ members }: { members: Member[] }) {
  const [q, setQ] = React.useState("")
  const [sort, setSort] = usePersistentState<SortKey>("teams:sort", "name-asc")
  const [view, setView] = usePersistentState<ViewMode>("teams:view", "grid")

  const stats = React.useMemo(() => {
    const total = members.length
    const now = new Date()
    const joinedThisMonth = members.filter(m => isSameMonth(new Date(m.createdAt), now)).length
    return { total, joinedThisMonth }
  }, [members])

  const filtered = React.useMemo(() => {
    let list = members.slice()
    if (q.trim()) {
      const t = q.toLowerCase()
      list = list.filter(m =>
        [m.name, m.email].filter(Boolean).some(v => v.toLowerCase().includes(t))
      )
    }
    list.sort((a, b) => {
      if (sort === "name-asc") return (a.name || a.email).localeCompare(b.name || b.email)
      if (sort === "name-desc") return (b.name || b.email).localeCompare(a.name || a.email)
      if (sort === "newest") return +new Date(b.createdAt) - +new Date(a.createdAt)
      if (sort === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt)
      return 0
    })
    return list
  }, [members, q, sort])

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border bg-linear-to-br from-primary/10 to-transparent">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total members</div>
            <div className="mt-1 text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Joined this month</div>
            <div className="mt-1 text-2xl font-bold">{stats.joinedThisMonth}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active roles</div>
            <div className="mt-1 text-2xl font-bold">Member</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email…"
              className={cn(
                "h-10 w-full rounded-xl border bg-background px-10 text-sm outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary"
              )}
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Sort members"
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            {/* icon inside select */}
            <ArrowUpAZ className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
          </div>
        </div>

        {/* View toggle */}
        <div className="ml-1 flex items-center rounded-xl border p-1">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="icon"
            className={cn("h-8 w-8 rounded-lg", view === "grid" ? "" : "text-muted-foreground")}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="icon"
            className={cn("h-8 w-8 rounded-lg", view === "list" ? "" : "text-muted-foreground")}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <CalendarPlus className="h-10 w-10 text-muted-foreground" />
            <CardTitle className="text-xl">No members found</CardTitle>
            <CardDescription>Try adjusting your search or invite someone new.</CardDescription>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-background">
          {filtered.map((m) => <MemberRow key={m.id} member={m} />)}
        </div>
      )}
    </div>
  )
}

/* ---------- Pieces ---------- */

function AvatarRing({ img, nameOrEmail }: { img?: string; nameOrEmail: string }) {
  const letter = (nameOrEmail || "?").trim().charAt(0).toUpperCase()
  return (
    <div className="relative">
      <Avatar className="h-12 w-12 ring-2 ring-primary/30 ring-offset-2">
        <AvatarImage src={img || ""} />
        <AvatarFallback>{letter}</AvatarFallback>
      </Avatar>
      <span className="absolute -right-1 -bottom-1 block h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
    </div>
  )
}

function MemberCard({ member }: { member: Member }) {
  const joined = new Date(member.createdAt)
  return (
    <Card className="group relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg hover:border-primary/50">
      {/* soft corner gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(120px_80px_at_0%_0%,hsl(var(--primary)/0.10),transparent_60%)]" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <AvatarRing img={member.image} nameOrEmail={member.name || member.email} />
          <div className="min-w-0">
            <CardTitle className="truncate">{member.name || "Unnamed User"}</CardTitle>
            <CardDescription className="truncate">{member.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Member</span>
          <span className="ml-auto text-xs text-muted-foreground">Joined {format(joined, "PP")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8">
            <a href={`mailto:${member.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => navigator.clipboard?.writeText(member.email)}
          >
            Copy email
          </Button>
          <Button asChild variant="ghost" size="sm" className="ml-auto h-8 text-primary">
            <Link href={`/dashboard/teams/${member.id}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function MemberRow({ member }: { member: Member }) {
  const joined = new Date(member.createdAt)
  return (
    <div className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
      <AvatarRing img={member.image} nameOrEmail={member.name || member.email} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{member.name || "Unnamed User"}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">Member</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="truncate">{member.email}</span>
          <span className="ml-auto">Joined {format(joined, "PP")}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="h-8">
          <a href={`mailto:${member.email}`}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => navigator.clipboard?.writeText(member.email)}
        >
          Copy
        </Button>
        <Button asChild variant="ghost" size="sm" className="h-8 text-primary">
          <Link href={`/dashboard/teams/${member.id}`}>View</Link>
        </Button>
      </div>
    </div>
  )
}
