"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    List, Grid2X2, SortAsc, FolderKanban, Search, Building2, Filter, CalendarClock,
} from "lucide-react"

type Org = { id: string; name: string }
type Project = {
    id: string
    key: string
    name: string
    description?: string
    status: string
    updatedAt: Date | string
    organization: { id: string; name: string }
    counts: { tasks: number; sprints: number }
}

type Props = {
    projects: Project[]
    organizations: Org[]
}

const STATUS_OPTIONS = ["ACTIVE", "PLANNING", "PAUSED", "ARCHIVED"] as const
type ViewMode = "grid" | "list"
type SortKey = "updated" | "name" | "tasks"

function statusStyle(status: string) {
    const s = status.toUpperCase()
    if (s === "ACTIVE") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    if (s === "PLANNING") return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
    if (s === "PAUSED") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
    if (s === "ARCHIVED") return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
    return "bg-muted text-foreground"
}

function usePersistentState<T>(
    key: string,
    initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = React.useState<T>(() => {
        if (typeof window === "undefined") return initial
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : initial
    })
    React.useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state))
        } catch { }
    }, [key, state])
    return [state, setState]
}

export default function ProjectsExplorer({ projects, organizations }: Props) {
    const router = useRouter()
    const sp = useSearchParams()

    // Toolbar state (persist basic prefs)
    const [view, setView] = usePersistentState<ViewMode>("projects:view", "grid")
    const [q, setQ] = React.useState(sp.get("q") ?? "")
    const [org, setOrg] = React.useState(sp.get("org") ?? "all")
    const [status, setStatus] = React.useState(sp.get("status") ?? "all")
    const [sort, setSort] = usePersistentState<SortKey>("projects:sort", "updated")

    // Derived filtering/sorting
    const filtered = React.useMemo(() => {
        let res = projects.slice()

        if (q.trim()) {
            const term = q.trim().toLowerCase()
            res = res.filter(p =>
                [p.name, p.key, p.description, p.organization?.name]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(term))
            )
        }

        if (org !== "all") res = res.filter(p => p.organization?.id === org)
        if (status !== "all") res = res.filter(p => p.status?.toUpperCase() === status.toUpperCase())

        res.sort((a, b) => {
            if (sort === "updated") {
                const da = new Date(a.updatedAt).getTime()
                const db = new Date(b.updatedAt).getTime()
                return db - da
            }
            if (sort === "name") return a.name.localeCompare(b.name)
            if (sort === "tasks") return (b.counts?.tasks ?? 0) - (a.counts?.tasks ?? 0)
            return 0
        })

        return res
    }, [projects, q, org, status, sort])

    // Push simple filters to URL (no reload)
    React.useEffect(() => {
        const usp = new URLSearchParams()
        if (q.trim()) usp.set("q", q.trim())
        if (org !== "all") usp.set("org", org)
        if (status !== "all") usp.set("status", status)
        const url = `/dashboard/projects${usp.toString() ? `?${usp.toString()}` : ""}`
        router.replace(url, { scroll: false })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, org, status])

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search projects, keys, descriptions…"
                            className={cn(
                                "h-10 w-full rounded-xl border bg-background px-10 text-sm outline-none",
                                "focus-visible:ring-2 focus-visible:ring-primary"
                            )}
                        />
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {/* Org filter */}
                    <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={org}
                            onChange={(e) => setOrg(e.target.value)}
                            className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="all">All orgs</option>
                            {organizations.map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="all">All statuses</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
                    </div>
                </div>

                {/* Sort + View */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <SortAsc className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="updated">Recently updated</option>
                            <option value="name">Name (A–Z)</option>
                            <option value="tasks">Most tasks</option>
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
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
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <FolderKanban className="h-6 w-6" />
                        </div>
                        <CardTitle className="mb-1 text-xl">No projects match your filters</CardTitle>
                        <CardDescription className="mb-4">
                            Try adjusting search, organization, or status — or create a new project.
                        </CardDescription>
                        <Link href="/dashboard/projects/new">
                            <Button size="sm">Create Project</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : view === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filtered.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                    ))}
                </div>
            ) : (
                <div className="divide-y rounded-xl border bg-background">
                    {filtered.map((p) => (
                        <ProjectRow key={p.id} project={p} />
                    ))}
                </div>
            )}
        </div>
    )
}

/* ---- Cards & Rows ---- */

function ProjectCard({ project }: { project: Project }) {
    const updated = new Date(project.updatedAt)
    return (
        <Link href={`/dashboard/projects/${project.id}`}>
            <Card
                className={cn(
                    "group relative h-full cursor-pointer overflow-hidden rounded-2xl border",
                    "transition-all hover:shadow-lg hover:border-primary/50"
                )}
            >
                {/* soft gradient accent */}
                <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(120px_80px_at_20%_0%,hsl(var(--primary)/0.12),transparent_60%),radial-gradient(120px_80px_at_100%_20%,hsl(var(--muted-foreground)/0.08),transparent_60%)]" />
                <CardHeader className="relative">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold">
                            {project.key?.slice(0, 3)?.toUpperCase() || "PRJ"}
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="truncate">{project.name}</CardTitle>
                            <CardDescription className="truncate flex items-center gap-2">
                                <span className="inline-flex items-center gap-1">
                                    <Building2 className="h-3.5 w-3.5" /> {project.organization?.name}
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative space-y-3">
                    {project.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No description yet.</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-0.5">
                            {project.counts.tasks} tasks
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5">
                            {project.counts.sprints} sprints
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 font-medium", statusStyle(project.status))}>
                            {project.status}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {updated.toLocaleDateString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function ProjectRow({ project }: { project: Project }) {
    const updated = new Date(project.updatedAt)
    return (
        <Link
            href={`/dashboard/projects/${project.id}`}
            className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold">
                {project.key?.slice(0, 3)?.toUpperCase() || "PRJ"}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{project.name}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyle(project.status))}>
                        {project.status}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="truncate inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {project.organization?.name}
                    </span>
                    <span>{project.counts.tasks} tasks</span>
                    <span>{project.counts.sprints} sprints</span>
                    <span className="ml-auto inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Updated {updated.toLocaleDateString()}
                    </span>
                </div>
            </div>
        </Link>
    )
}
