import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TaskDetail } from "@/components/task-detail"
import { Skeleton } from "@/components/ui/skeleton"

async function getTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignee: true,
      reporter: true,
      sprint: true,
      labels: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      attachments: true,
      watchers: true,
    },
  })

  return task
}

export default async function TaskPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) {
    return notFound()
  }

  const task = await getTask(params.id)
  if (!task) {
    return notFound()
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<TaskDetailSkeleton />}>
        <TaskDetail task={task} userId={session.user.id} />
      </Suspense>
    </div>
  )
}

function TaskDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
