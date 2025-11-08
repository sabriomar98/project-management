import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateProjectDialog } from "@/components/create-project-dialog"
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
      {/* Premium header with gradient + metrics */}
      <div className="relative overflow-hidden rounded-2xl border p-6 bg-linear-to-br from-primary/15 via-background to-background">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full blur-3xl opacity-30 bg-primary" />
        <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full blur-3xl opacity-20 bg-sky-500 dark:bg-sky-600" />


        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      </div>


      <ProjectsExplorer
        projects={projects.map((p: { id: any; key: any; name: any; description: any }) => ({
          id: String(p.id),
          key: p.key ?? "",
          name: p.name ?? "",
          description: p.description ?? "",
        }))}
        organizations={organizations.map((o: { id: any; name: any }) => ({
          id: String(o.id),
          name: o.name,
        }))}
      />
    </div>
  )
}