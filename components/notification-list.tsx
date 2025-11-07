"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check } from "lucide-react"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

interface NotificationListProps {
  notifications: Notification[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  const queryClient = useQueryClient()

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })
      if (!res.ok) throw new Error("Failed to mark as read")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No notifications yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
          <CardContent className="p-4 flex items-start justify-between">
            <div className="flex gap-3 flex-1">
              <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(notification.createdAt), "PPp")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <>
                  <Badge variant="secondary">New</Badge>
                  <Button size="sm" variant="ghost" onClick={() => markAsRead.mutate(notification.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
