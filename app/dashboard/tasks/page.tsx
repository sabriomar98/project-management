// =============================
// app/dashboard/tasks/page.tsx
// =============================
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import TasksExplorer from "@/components/tasks-explorer-advanced"
import CreateTaskDialog from "@/components/create-task-dialog"

export default async function TasksPage() {
    const user = await getCurrentUser()
    if (!user) return null

    const [tasks, projects, users] = await Promise.all([
        prisma.task.findMany({
            where: {
                project: {
                    organization: {
                        members: { some: { userId: user.id } },
                    },
                },
            },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { updatedAt: "desc" },
        }),
        prisma.project.findMany({
            where: { organization: { members: { some: { userId: user.id } } } },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        prisma.user
            .findMany({
                where: {
                    organizations: {
                        some: { organization: { members: { some: { userId: user.id } } } },
                    },
                },
                select: { id: true, name: true, email: true },
                orderBy: { name: "asc" },
            })
            .catch(() => []),
    ])

    return (
        <div className="space-y-6">
            {/* Premium header with gradient + quick stats */}
            <div className="relative overflow-hidden rounded-2xl border p-6 bg-linear-to-br from-primary/15 via-background to-background">
                <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full blur-3xl opacity-30 bg-primary" />
                <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full blur-3xl opacity-20 bg-fuchsia-500 dark:bg-fuchsia-600" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                        <p className="text-muted-foreground">
                            Plan, prioritize, and track progress across your projects.
                        </p>
                    </div>
                    <CreateTaskDialog projects={projects} users={users}>
                        <Button size="sm" className="h-9">
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </CreateTaskDialog>
                </div>
            </div>

            <TasksExplorer
                tasks={tasks.map((t: { id: any; title: any; description: any; status: string; priority: string; updatedAt: string | number | Date; createdAt: string | number | Date; project: { id: any; name: any }; assignee: { id: any; name: any; email: any }; createdBy: { id: any; name: any } }) => ({
                    id: String(t.id),
                    title: t.title ?? "",
                    description: t.description ?? "",
                    status: (t.status as string) ?? "TODO", // must be one of: TODO | IN_PROGRESS | IN_REVIEW | BLOCKED | DONE
                    priority: (t.priority as string) ?? "MEDIUM",
                    updatedAt: new Date(t.updatedAt).toISOString(), // ISO for client
                    createdAt: new Date(t.createdAt).toISOString(),
                    project: { id: String(t.project?.id ?? ""), name: t.project?.name ?? "" },
                    assignee: t.assignee
                        ? {
                            id: String(t.assignee.id),
                            name: t.assignee.name ?? t.assignee.email ?? "User",
                        }
                        : null,
                    createdBy: t.createdBy
                        ? { id: String(t.createdBy.id), name: t.createdBy.name ?? "" }
                        : null,
                }))}
                projects={projects.map((p: { id: any; name: any }) => ({ id: String(p.id), name: p.name }))}
                users={users.map((u: { id: any; name: any; email: any }) => ({
                    id: String(u.id),
                    name: u.name ?? u.email ?? "User",
                }))}
            />
        </div>
    )
}
