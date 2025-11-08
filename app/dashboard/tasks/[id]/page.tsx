// app/dashboard/tasks/[id]/page.tsx
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, User2 } from "lucide-react"
import { cn } from "@/lib/utils"

function priorityBadge(priority?: string) {
  const p = (priority || "").toUpperCase()
  if (p === "URGENT") return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
  if (p === "HIGH") return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
  if (p === "MEDIUM") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
}

function statusBadge(status?: string) {
  const s = (status || "").toUpperCase()
  if (s === "TODO") return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
  if (s === "IN_PROGRESS") return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
  if (s === "IN_REVIEW") return "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
  if (s === "BLOCKED") return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
}

async function getTaskSafe(taskId: string | undefined, userId: string) {
  if (!taskId || taskId === "undefined" || taskId === "null") return null
  return prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        organization: {
          members: { some: { userId } },
        },
      },
    },
    include: {
      project: true,
      assignee: true,
      createdBy: true,
      sprint: true,
      labels: true,
      comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
      attachments: true,
      // watchers: true, // ❌ supprimé (inexistant)
      // Optionnel si ces relations existent dans ton schéma :
      // parent: true,
      // subtasks: true,
      // activityLogs: true,
    },
  })
}

export default async function TaskPage({ params }: { params: Promise<{ id?: string | string[] }> }) {
  const resolvedParams = await params
  const user = await getCurrentUser()
  if (!user) return notFound()

  // Normaliser l'id
  const rawId = resolvedParams.id
  const taskId = Array.isArray(rawId) ? rawId[0] : rawId

  const task = await getTaskSafe(taskId, user.id)
  if (!task) return notFound()

  const updated = new Date(task.updatedAt)

  return (
    <div className="space-y-6">
      {/* Premium header */}
      <div className="relative overflow-hidden rounded-2xl border p-6 bg-linear-to-br from-primary/15 via-background to-background">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full blur-3xl opacity-30 bg-primary" />
        <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full blur-3xl opacity-20 bg-fuchsia-500 dark:bg-fuchsia-600" />
        <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
        <p className="mt-1 text-muted-foreground">In {task.project?.name || "Project"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("rounded-full px-2 py-0.5", statusBadge(task.status))}>
            {task.status}
          </span>
          <span className={cn("rounded-full px-2 py-0.5", priorityBadge(task.priority))}>
            {task.priority}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
            <CalendarClock className="h-3.5 w-3.5" /> {updated.toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
            <User2 className="h-3.5 w-3.5" /> {task.assignee?.name ?? "Unassigned"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {task.description || "No description."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Project</span>
              <span>{task.project?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assignee</span>
              <span>{task.assignee?.name ?? "Unassigned"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reporter</span>
              <span>{task.createdBy?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sprint</span>
              <span>{task.sprint?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{updated.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {task.labels?.map((l: any) => (
                <Badge key={l.id} variant="secondary">
                  {l.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
