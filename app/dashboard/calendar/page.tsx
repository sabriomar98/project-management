import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CalendarView } from "@/components/calendar-view"

export default async function CalendarPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const tasks = await prisma.task.findMany({
    where: {
      project: {
        organization: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
      dueDate: {
        not: null,
      },
    },
    include: {
      project: true,
      assignee: true,
    },
  })

  const sprints = await prisma.sprint.findMany({
    where: {
      project: {
        organization: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    },
    include: {
      project: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View all your tasks and sprints in a calendar format</p>
      </div>
      <CalendarView tasks={tasks} sprints={sprints} />
    </div>
  )
}
