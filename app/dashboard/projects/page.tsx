import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ProjectsExplorer from "@/components/projects-explorer"

export default async function ProjectsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [projects, organizations] = await Promise.all([
    prisma.project.findMany({
      where: {
        organization: {
          members: { some: { userId: user.id } },
        },
      },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { tasks: true, sprints: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.organization.findMany({
      where: { members: { some: { userId: user.id } } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage initiatives across organizations, track progress, and jump back into work.
          </p>
        </div>
        <CreateProjectDialog organizations={organizations}>
          <Button size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </CreateProjectDialog>
      </div>

      {/* Advanced explorer */}
      <ProjectsExplorer
        projects={projects.map((p: { id: any; key: any; name: any; description: any; status: string; updatedAt: any; organization: { id: any; name: any }; _count: { tasks: any; sprints: any } }) => ({
          id: String(p.id),
          key: p.key ?? "",
          name: p.name ?? "",
          description: p.description ?? "",
          status: (p.status as string) ?? "ACTIVE",
          updatedAt: p.updatedAt,
          organization: { id: String(p.organization?.id ?? ""), name: p.organization?.name ?? "" },
          counts: { tasks: p._count.tasks ?? 0, sprints: p._count.sprints ?? 0 },
        }))}
        organizations={organizations.map((o: { id: any; name: any }) => ({ id: String(o.id), name: o.name }))}
      />
    </div>
  )
}
