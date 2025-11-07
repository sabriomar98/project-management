import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FolderKanban } from "lucide-react"
import Link from "next/link"
import { CreateProjectDialog } from "@/components/create-project-dialog"

export default async function ProjectsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const projects = await sql`
    SELECT p.*,
           json_build_object('id', o.id, 'name', o.name) as organization,
           (SELECT COUNT(*)::int FROM tasks WHERE "projectId" = p.id) as task_count,
           (SELECT COUNT(*)::int FROM sprints WHERE "projectId" = p.id) as sprint_count
    FROM projects p
    JOIN organizations o ON p."organizationId" = o.id
    JOIN organization_members om ON o.id = om."organizationId"
    WHERE om."userId" = ${user.id}
    ORDER BY p."updatedAt" DESC
  `

  const organizations = await sql`
    SELECT o.*
    FROM organizations o
    JOIN organization_members om ON o.id = om."organizationId"
    WHERE om."userId" = ${user.id}
  `

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <CreateProjectDialog organizations={organizations}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </CreateProjectDialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first project to get started</p>
            <CreateProjectDialog organizations={organizations}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CreateProjectDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                      {project.key}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{project.name}</CardTitle>
                      <CardDescription className="truncate">{project.organization.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{project.task_count} tasks</span>
                      <span>{project.sprint_count} sprints</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          project.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : project.status === "PLANNING"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
