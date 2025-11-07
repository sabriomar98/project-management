import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProjectHeader } from "@/components/project-header"
import { SprintList } from "@/components/sprint-list"
import { TaskList } from "@/components/task-list"
import { CreateSprintDialog } from "@/components/create-sprint-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { KanbanBoard } from "@/components/kanban-board"
import { GanttChart } from "@/components/gantt-chart"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
          },
        },
      },
      sprints: {
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        include: {
          assignee: true,
          labels: true,
          sprint: true,
        },
        orderBy: { position: "asc" },
      },
      labels: true,
    },
  })

  if (!project || project.organization.members.length === 0) {
    notFound()
  }

  const users = await prisma.user.findMany({
    where: {
      organizationMembers: {
        some: {
          organizationId: project.organizationId,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Kanban Board</h2>
            <CreateTaskDialog projectId={project.id} users={users} labels={project.labels}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </CreateTaskDialog>
          </div>
          <KanbanBoard tasks={project.tasks} projectId={project.id} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Task List</h2>
            <CreateTaskDialog projectId={project.id} users={users} labels={project.labels}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </CreateTaskDialog>
          </div>
          <TaskList tasks={project.tasks} />
        </TabsContent>

        <TabsContent value="gantt" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Gantt Chart</h2>
          </div>
          <GanttChart tasks={project.tasks} sprints={project.sprints} />
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sprints</h2>
            <CreateSprintDialog projectId={project.id}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Sprint
              </Button>
            </CreateSprintDialog>
          </div>
          <SprintList sprints={project.sprints} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
