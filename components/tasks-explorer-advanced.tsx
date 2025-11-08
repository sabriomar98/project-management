"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Rows,
    Search,
    Filter,
    AlarmClockCheck,
    ChevronRight,
    Flame,
    User2,
    CalendarClock,
    CheckCircle2,
    Circle,
    SquareStack,
    Trash2,
} from "lucide-react"

// ---------- Types ----------

type ProjectRef = { id: string; name: string }

type UserRef = { id: string; name: string }

type Task = {
    id: string
    title: string
    description?: string
    priority: string // LOW | MEDIUM | HIGH | URGENT
    status: string // TODO | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED
    updatedAt: Date | string
    createdAt: Date | string
    project: ProjectRef
    assignee: UserRef | null
    createdBy: UserRef | null
}

type Props = {
    tasks?: Task[]
    projects?: ProjectRef[]
    users?: UserRef[]
}

type ViewMode = "kanban" | "table"
type SortKey = "recent" | "priority" | "title"

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE"] as const
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const

// ---------- Helpers ----------

function priorityBadge(priority: string) {
    const p = (priority || "").toUpperCase()
    if (p === "URGENT") return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
    if (p === "HIGH") return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
    if (p === "MEDIUM") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
}

function statusBadge(status: string) {
    const s = (status || "").toUpperCase()
    if (s === "TODO") return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
    if (s === "IN_PROGRESS") return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
    if (s === "IN_REVIEW") return "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
    if (s === "BLOCKED") return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
}

function statusIcon(status: string) {
    const s = (status || "").toUpperCase()
    if (s === "TODO") return <Circle className="h-3.5 w-3.5" />
    if (s === "IN_PROGRESS") return <SquareStack className="h-3.5 w-3.5" />
    if (s === "IN_REVIEW") return <AlarmClockCheck className="h-3.5 w-3.5" />
    if (s === "BLOCKED") return <Flame className="h-3.5 w-3.5" />
    return <CheckCircle2 className="h-3.5 w-3.5" />
}

function usePersistentState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
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

// ---------- Component ----------

export default function TasksExplorer({
    tasks = [],
    projects = [],
    users = [],
}: Props) {
    const router = useRouter()
    const sp = useSearchParams()

    const [view, setView] = usePersistentState<ViewMode>("tasks:view", "kanban")
    const [q, setQ] = React.useState(sp.get("q") ?? "")
    const [project, setProject] = React.useState(sp.get("project") ?? "all")
    const [status, setStatus] = React.useState(sp.get("status") ?? "all")
    const [priority, setPriority] = React.useState(sp.get("priority") ?? "all")
    const [assignee, setAssignee] = React.useState(sp.get("assignee") ?? "all")
    const [sort, setSort] = usePersistentState<SortKey>("tasks:sort", "recent")

    const filtered = React.useMemo(() => {
        let res = tasks.slice()

        if (q.trim()) {
            const t = q.trim().toLowerCase()
            res = res.filter((x) =>
                [x.title, x.description, x.project?.name, x.assignee?.name]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(t)),
            )
        }
        if (project !== "all") res = res.filter((x) => x.project?.id === project)
        if (status !== "all")
            res = res.filter((x) => (x.status || "").toUpperCase() === status.toUpperCase())
        if (priority !== "all")
            res = res.filter((x) => (x.priority || "").toUpperCase() === priority.toUpperCase())
        if (assignee !== "all") res = res.filter((x) => x.assignee?.id === assignee)

        res.sort((a, b) => {
            if (sort === "recent") return +new Date(b.updatedAt) - +new Date(a.updatedAt)
            if (sort === "title") return a.title.localeCompare(b.title)
            if (sort === "priority")
                return (
                    PRIORITIES.indexOf((b.priority || "MEDIUM").toUpperCase() as any) -
                    PRIORITIES.indexOf((a.priority || "MEDIUM").toUpperCase() as any)
                )
            return 0
        })

        return res
    }, [tasks, q, project, status, priority, assignee, sort])

    // URL sync (no reload)
    React.useEffect(() => {
        const usp = new URLSearchParams()
        if (q.trim()) usp.set("q", q.trim())
        if (project !== "all") usp.set("project", project)
        if (status !== "all") usp.set("status", status)
        if (priority !== "all") usp.set("priority", priority)
        if (assignee !== "all") usp.set("assignee", assignee)
        const url = `/dashboard/tasks${usp.toString() ? `?${usp.toString()}` : ""}`
        router.replace(url, { scroll: false })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, project, status, priority, assignee])

    // Group for Kanban
    const byStatus = React.useMemo(() => {
        return STATUSES.map((s) => ({
            key: s,
            items: filtered.filter((t) => (t.status || "").toUpperCase() === s),
        }))
    }, [filtered])

    // Metrics for chips
    const metrics = React.useMemo(() => {
        const total = tasks.length
        const byS = Object.fromEntries(
            STATUSES.map((s) => [s, tasks.filter((t) => (t.status || "").toUpperCase() === s).length]),
        ) as Record<(typeof STATUSES)[number], number>
        const byP = Object.fromEntries(
            PRIORITIES.map((p) => [
                p,
                tasks.filter((t) => (t.priority || "").toUpperCase() === p).length,
            ]),
        ) as Record<(typeof PRIORITIES)[number], number>
        return { total, byS, byP }
    }, [tasks])

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-card/60 p-4 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-80">
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by title, project, assignee…"
                            className="h-10 rounded-xl pl-10"
                        />
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <div className="relative">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="all">All projects</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ▾
                        </span>
                    </div>

                    <div className="relative">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="all">All statuses</option>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ▾
                        </span>
                    </div>

                    <div className="relative">
                        <Flame className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="all">All priorities</option>
                            {PRIORITIES.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ▾
                        </span>
                    </div>

                    <div className="relative">
                        <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className="h-10 appearance-none rounded-xl border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="all">All assignees</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ▾
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortKey)}
                                className="h-10 appearance-none rounded-xl border bg-background px-3 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                aria-label="Sort tasks"
                            >
                                <option value="recent">Recently updated</option>
                                <option value="title">Title (A–Z)</option>
                                <option value="priority">Priority (High→Low)</option>
                            </select>
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                ▾
                            </span>
                        </div>

                        <div className="ml-1 flex items-center rounded-xl border p-1">
                            <Button
                                variant={view === "kanban" ? "default" : "ghost"}
                                size="icon"
                                className={cn("h-8 w-8 rounded-lg", view === "kanban" ? "" : "text-muted-foreground")}
                                onClick={() => setView("kanban")}
                                aria-label="Kanban view"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={view === "table" ? "default" : "ghost"}
                                size="icon"
                                className={cn("h-8 w-8 rounded-lg", view === "table" ? "" : "text-muted-foreground")}
                                onClick={() => setView("table")}
                                aria-label="Table view"
                            >
                                <Rows className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chips / metrics */}
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                        {metrics.total} total
                    </span>
                    {STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus((prev) => (prev === s ? "all" : s))}
                            className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors",
                                status === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                            )}
                        >
                            {s.toLowerCase()} • {metrics.byS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Circle className="h-10 w-10 text-muted-foreground" />
                        <CardTitle className="mt-2 text-xl">No tasks found</CardTitle>
                        <CardDescription>Try different filters or create a new task.</CardDescription>
                    </CardContent>
                </Card>
            ) : view === "kanban" ? (
                <KanbanBoard groups={byStatus} />
            ) : (
                <TasksTable tasks={filtered} />
            )}
        </div>
    )
}

/* ---------- Kanban ---------- */

function KanbanBoard({ groups }: { groups: { key: string; items: Task[] }[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {groups.map((g) => (
                <div
                    key={g.key}
                    className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border bg-background"
                >
                    <div className="flex items-center justify-between border-b p-3">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold">
                            {statusIcon(g.key)} <span>{g.key.replace("_", " ")}</span>
                        </div>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                            {g.items.length}
                        </span>
                    </div>
                    <div className="space-y-3 p-3">
                        {g.items.map((t) => (
                            <TaskCard key={t.id} task={t} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function TaskCard({ task }: { task: Task }) {
    const updated = new Date(task.updatedAt)
    return (
        <Link href={`/dashboard/tasks/${task.id}`}>
            <div
                className={cn(
                    "group relative rounded-xl border p-3 transition-all hover:shadow-lg",
                    "[border-image:linear-gradient(to_bottom_right,hsl(var(--primary)/.4),transparent)_1]",
                )}
            >
                <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{task.title}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", priorityBadge(task.priority))}>
                        {task.priority}
                    </span>
                </div>
                {task.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No description.</p>
                )}
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("rounded-full px-2 py-0.5", statusBadge(task.status))}>
                        {task.status}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" /> {updated.toLocaleDateString()}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1">
                        <User2 className="h-3.5 w-3.5" /> {task.assignee?.name ?? "Unassigned"}
                    </span>
                </div>
            </div>
        </Link>
    )
}

/* ---------- Table ---------- */

function TasksTable({ tasks }: { tasks: Task[] }) {
    return (
        <div className="overflow-hidden rounded-2xl border">
            <div className="grid grid-cols-12 gap-0 border-b bg-muted/40 px-4 py-2 text-xs font-semibold">
                <div className="col-span-5">Title</div>
                <div className="col-span-2">Project</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-2">Updated</div>
            </div>
            <div className="divide-y">
                {tasks.map((t) => (
                    <Link
                        key={t.id}
                        href={`/dashboard/tasks/${t.id}`}
                        className="group grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                        <div className="col-span-5 flex min-w-0 items-center gap-2">
                            {statusIcon(t.status)}
                            <div className="min-w-0">
                                <div className="truncate font-medium">{t.title}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {t.description || "—"}
                                </div>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <div className="col-span-2 truncate text-sm">{t.project?.name}</div>
                        <div className="col-span-1 text-xs">
                            <span className={cn("rounded-full px-2 py-0.5", priorityBadge(t.priority))}>
                                {t.priority}
                            </span>
                        </div>
                        <div className="col-span-2 truncate text-sm">{t.assignee?.name ?? "Unassigned"}</div>
                        <div className="col-span-2 text-sm">
                            {new Date(t.updatedAt).toLocaleDateString()}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
