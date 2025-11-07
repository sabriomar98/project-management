"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Task {
  id: string
  title: string
  dueDate: Date | null
  status: string
  priority: string
  project: {
    name: string
    key: string
  }
}

interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: string
  project: {
    name: string
  }
}

interface CalendarViewProps {
  tasks: Task[]
  sprints: Sprint[]
}

export function CalendarView({ tasks, sprints }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDate = (date: number) => {
    const dateObj = new Date(year, month, date)
    const dateStr = dateObj.toDateString()

    const dayTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate).toDateString() === dateStr)

    const daySprints = sprints.filter((sprint) => {
      const start = new Date(sprint.startDate)
      const end = new Date(sprint.endDate)
      return dateObj >= start && dateObj <= end
    })

    return { tasks: dayTasks, sprints: daySprints }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = index + 1
            const events = getEventsForDate(date)
            const isToday = new Date().toDateString() === new Date(year, month, date).toDateString()

            return (
              <div
                key={date}
                className={`min-h-[100px] rounded-lg border p-2 ${isToday ? "border-primary bg-primary/5" : ""}`}
              >
                <div className={`mb-1 text-sm font-medium ${isToday ? "text-primary" : ""}`}>{date}</div>
                <div className="space-y-1">
                  {events.sprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      className="rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300 truncate"
                      title={sprint.name}
                    >
                      {sprint.name}
                    </div>
                  ))}
                  {events.tasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="rounded bg-muted px-1 py-0.5 text-xs truncate" title={task.title}>
                      {task.project.key} - {task.title}
                    </div>
                  ))}
                  {events.tasks.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{events.tasks.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
