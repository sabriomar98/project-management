import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectProgressChart } from "@/components/project-progress-chart"
import { TaskDistributionChart } from "@/components/task-distribution-chart"
import { TeamVelocityChart } from "@/components/team-velocity-chart"
import { BarChart3, TrendingUp, CheckCircle2, Clock } from "lucide-react"

async function getReportsData() {
  const totalProjects = await prisma.project.count()
  const totalTasks = await prisma.task.count()
  const completedTasks = await prisma.task.count({
    where: { status: "DONE" },
  })
  const activeSprints = await prisma.sprint.count({
    where: { status: "ACTIVE" },
  })

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    activeSprints,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
  }
}

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user) return null

  const data = await getReportsData()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.completionRate}% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sprints</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeSprints}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Project Progress</TabsTrigger>
          <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
          <TabsTrigger value="velocity">Team Velocity</TabsTrigger>
        </TabsList>
        <TabsContent value="progress" className="space-y-4">
          <ProjectProgressChart />
        </TabsContent>
        <TabsContent value="distribution" className="space-y-4">
          <TaskDistributionChart />
        </TabsContent>
        <TabsContent value="velocity" className="space-y-4">
          <TeamVelocityChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
