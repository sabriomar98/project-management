import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CalendarView } from "@/components/calendar-view"

export default async function CalendarPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/signin")

  const [tasks, sprints] = await Promise.all([
    prisma.task.findMany({
      where: {
        project: {
          organization: { members: { some: { userId: user.id } } },
        },
        dueDate: { not: null },
      },
      include: {
        project: { select: { name: true, key: true } },
        assignee: true,
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.sprint.findMany({
      where: {
        project: {
          organization: { members: { some: { userId: user.id } } },
        },
      },
      include: {
        project: { select: { name: true } },
      },
      orderBy: { startDate: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-linear-to-br from-primary/10 via-background to-background p-6">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          See your tasks (by priority) and sprint windows across the month.
        </p>
      </div>
      <CalendarView tasks={tasks as any} sprints={sprints as any} />
    </div>
  )
}
