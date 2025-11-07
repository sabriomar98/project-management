"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [taskAssigned, setTaskAssigned] = useState(true)
  const [taskCompleted, setTaskCompleted] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [sprintUpdates, setSprintUpdates] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="task-assigned">Task Assignments</Label>
            <p className="text-sm text-muted-foreground">Get notified when a task is assigned to you</p>
          </div>
          <Switch id="task-assigned" checked={taskAssigned} onCheckedChange={setTaskAssigned} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="task-completed">Task Completions</Label>
            <p className="text-sm text-muted-foreground">Get notified when tasks are completed</p>
          </div>
          <Switch id="task-completed" checked={taskCompleted} onCheckedChange={setTaskCompleted} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="mentions">Mentions</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
          </div>
          <Switch id="mentions" checked={mentions} onCheckedChange={setMentions} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sprint-updates">Sprint Updates</Label>
            <p className="text-sm text-muted-foreground">Get notified about sprint status changes</p>
          </div>
          <Switch id="sprint-updates" checked={sprintUpdates} onCheckedChange={setSprintUpdates} />
        </div>
      </CardContent>
    </Card>
  )
}
