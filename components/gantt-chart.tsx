"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMemo } from "react"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  dueDate: Date | null
  createdAt: Date
  sprint: {
    id: string
    name: string
    startDate: Date
    endDate: Date
  } | null
}

interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: string
}

interface GanttChartProps {
  tasks: Task[]
  sprints: Sprint[]
}

export function GanttChart({ tasks, sprints }: GanttChartProps) {
  const { startDate, endDate, totalDays } = useMemo(() => {
    const allDates = [
      ...sprints.map((s) => new Date(s.startDate)),
      ...sprints.map((s) => new Date(s.endDate)),
      ...tasks.filter((t) => t.dueDate).map((t) => new Date(t.dueDate!)),
    ]

    if (allDates.length === 0) {
      const today = new Date()
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        totalDays: 30,
      }
    }

    const start = new Date(Math.min(...allDates.map((d) => d.getTime())))
    const end = new Date(Math.max(...allDates.map((d) => d.getTime())))
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return {
      startDate: start,
      endDate: end,
      totalDays: Math.max(days, 30),
    }
  }, [tasks, sprints])

  const getBarPosition = (itemStart: Date, itemEnd: Date) => {
    const start = new Date(itemStart).getTime()
    const end = new Date(itemEnd).getTime()
    const chartStart = startDate.getTime()
    const chartEnd = endDate.getTime()

    const leftPercent = ((start - chartStart) / (chartEnd - chartStart)) * 100
    const widthPercent = ((end - start) / (chartEnd - chartStart)) * 100

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.min(100 - leftPercent, widthPercent)}%`,
    }
  }

  const monthHeaders = useMemo(() => {
    const headers: { month: string; width: number }[] = []
    let currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate <= end) {
      const monthStart = new Date(currentDate)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const daysInView = Math.min(
        monthEnd.getDate() - monthStart.getDate() + 1,
        Math.ceil((end.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)),
      )

      headers.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        width: (daysInView / totalDays) * 100,
      })

      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }

    return headers
  }, [startDate, endDate, totalDays])

  if (sprints.length === 0 && tasks.filter((t) => t.dueDate).length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold mb-2">No timeline data</h3>
          <p className="text-sm text-muted-foreground">Add sprints or tasks with due dates to see the Gantt chart</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex border-b">
          <div className="w-64 flex-shrink-0 p-2 font-medium">Item</div>
          <div className="flex-1 flex">
            {monthHeaders.map((header, index) => (
              <div
                key={index}
                className="border-l p-2 text-center text-sm font-medium"
                style={{ width: `${header.width}%` }}
              >
                {header.month}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="flex items-center">
              <div className="w-64 flex-shrink-0 p-2">
                <div className="font-medium truncate">{sprint.name}</div>
                <Badge variant="outline" className="mt-1">
                  Sprint
                </Badge>
              </div>
              <div className="flex-1 relative h-10">
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-6 rounded bg-blue-500/20 border-2 border-blue-500"
                  style={getBarPosition(sprint.startDate, sprint.endDate)}
                />
              </div>
            </div>
          ))}

          {tasks
            .filter((task) => task.dueDate)
            .map((task) => (
              <div key={task.id} className="flex items-center">
                <div className="w-64 flex-shrink-0 p-2">
                  <div className="font-medium truncate text-sm">{task.title}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Task
                  </Badge>
                </div>
                <div className="flex-1 relative h-10">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-4 rounded bg-primary/20 border border-primary"
                    style={getBarPosition(task.createdAt, task.dueDate || new Date())}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  )
}
