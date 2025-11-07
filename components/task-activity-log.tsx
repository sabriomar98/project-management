"use client"

import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskActivityLogProps {
  taskId: string
}

export function TaskActivityLog({ taskId }: TaskActivityLogProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/activity`)
      if (!res.ok) throw new Error("Failed to fetch activity")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => (
        <div key={activity.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.image || ""} />
            <AvatarFallback>{activity.user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-muted-foreground">{activity.details}</span>
            </p>
            <p className="text-xs text-muted-foreground">{format(new Date(activity.createdAt), "PPp")}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
