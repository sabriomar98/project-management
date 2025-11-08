"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Building2, Users, FolderKanban, Search, Grid2X2, List, CalendarClock,
} from "lucide-react"

type Org = {
    id: string
    name: string
    slug: string
    createdAt: string // ISO
    counts: { members: number; projects: number }
}

type SortKey = "recent" | "name-asc" | "name-desc" | "projects" | "members"
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

export default function OrganizationsExplorer({ orgs }: { orgs: Org[] }) {
    const [q, setQ] = React.useState("")
    const [sort, setSort] = usePersistentState<SortKey>("orgs:sort", "recent")
    const [view, setView] = usePersistentState<ViewMode>("orgs:view", "grid")

    const filtered = React.useMemo(() => {
        let list = orgs.slice()
        if (q.trim()) {
            const t = q.toLowerCase()
            list = list.filter(o =>
                [o.name, o.slug].some(v => v.toLowerCase().includes(t))
            )
        }
        list.sort((a, b) => {
            if (sort === "recent") return +new Date(b.createdAt) - +new Date(a.createdAt)
            if (sort === "name-asc") return a.name.localeCompare(b.name)
            if (sort === "name-desc") return b.name.localeCompare(a.name)
            if (sort === "projects") return (b.counts.projects ?? 0) - (a.counts.projects ?? 0)
            if (sort === "members") return (b.counts.members ?? 0) - (a.counts.members ?? 0)
            return 0
        })
        return list
    }, [orgs, q, sort])

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative w-full md:w-96">
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by name or slug…"
                            className="h-10 rounded-xl pl-10"
                        />
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            className="h-10 appearance-none rounded-xl border bg-background px-3 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Sort organizations"
                        >
                            <option value="recent">Recently created</option>
                            <option value="name-asc">Name (A–Z)</option>
                            <option value="name-desc">Name (Z–A)</option>
                            <option value="projects">Most projects</option>
                            <option value="members">Most members</option>
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
                    </div>
                </div>

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
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                        <CardTitle className="text-xl">No organizations found</CardTitle>
                        <CardDescription>Try a different search or create a new organization.</CardDescription>
                    </CardContent>
                </Card>
            ) : view === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filtered.map((o) => <OrganizationCard key={o.id} org={o} />)}
                </div>
            ) : (
                <div className="divide-y rounded-xl border bg-background">
                    {filtered.map((o) => <OrganizationRow key={o.id} org={o} />)}
                </div>
            )}
        </div>
    )
}

/* ---------- Pieces ---------- */

function BrandIcon({ name }: { name: string }) {
    const letter = (name || "?").trim().charAt(0).toUpperCase()
    return (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="font-bold">{letter}</span>
        </div>
    )
}

function OrganizationCard({ org }: { org: Org }) {
    const created = new Date(org.createdAt)
    return (
        <Link href={`/dashboard/organizations/${org.slug}`}>
            <Card className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border transition-all hover:border-primary/50 hover:shadow-lg">
                {/* soft gradient accents */}
                <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(120px_80px_at_10%_0%,hsl(var(--primary)/0.12),transparent_60%),radial-gradient(120px_80px_at_100%_20%,hsl(var(--muted-foreground)/0.08),transparent_60%)]" />
                <CardHeader className="relative">
                    <div className="flex items-center gap-3">
                        <BrandIcon name={org.name} />
                        <div className="min-w-0">
                            <CardTitle className="truncate">{org.name}</CardTitle>
                            <CardDescription className="truncate">@{org.slug}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                            <Users className="h-3.5 w-3.5" /> {org.counts.members} members
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                            <FolderKanban className="h-3.5 w-3.5" /> {org.counts.projects} projects
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {format(created, "PP")}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function OrganizationRow({ org }: { org: Org }) {
    const created = new Date(org.createdAt)
    return (
        <Link
            href={`/dashboard/organizations/${org.slug}`}
            className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
        >
            <BrandIcon name={org.name} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{org.name}</span>
                    <span className="truncate text-xs text-muted-foreground">@{org.slug}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {org.counts.members} members
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <FolderKanban className="h-3.5 w-3.5" /> {org.counts.projects} projects
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {format(created, "PP")}
                    </span>
                </div>
            </div>
        </Link>
    )
}
