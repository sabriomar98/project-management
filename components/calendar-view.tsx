"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeCheck, ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Task = {
  id: string
  title: string
  dueDate: Date | string | null
  status: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string
  project: { name: string; key: string }
}

type Sprint = {
  id: string
  name: string
  startDate: Date | string
  endDate: Date | string
  status: "PLANNED" | "ACTIVE" | "DONE" | "PAUSED" | string
  project: { name: string }
}

type CalendarViewProps = { tasks: Task[]; sprints: Sprint[] }

const MONTHS = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// --- Colors ---
const priorityClass = (p?: string) => {
  const v = (p || "").toUpperCase()
  if (v === "CRITICAL") return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
  if (v === "HIGH") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  if (v === "MEDIUM") return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
  if (v === "LOW") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
  return "bg-muted text-foreground"
}
const sprintClass = (s?: string) => {
  const v = (s || "").toUpperCase()
  if (v === "ACTIVE") return "from-primary/30 to-primary/10 text-primary-foreground/90"
  if (v === "DONE") return "from-emerald-300/30 to-emerald-300/10 text-emerald-900/80 dark:text-emerald-200/90"
  if (v === "PAUSED") return "from-amber-300/30 to-amber-300/10 text-amber-900/80 dark:text-amber-200/90"
  return "from-sky-300/30 to-sky-300/10 text-sky-900/80 dark:text-sky-200/90" // PLANNED/default
}

// Helpers
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const clampDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d))

export function CalendarView({ tasks, sprints }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => startOfDay(new Date())) // month cursor

  // Build a 6x7 grid including prev/next month trailing days
  const grid = useMemo(() => {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    const first = new Date(y, m, 1)
    const firstWeekday = first.getDay() // 0..6
    const firstCell = new Date(y, m, 1 - firstWeekday)
    const cells: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstCell)
      d.setDate(firstCell.getDate() + i)
      cells.push(d)
    }
    return cells
  }, [cursor])

  // Group events by day
  const byDay = useMemo(() => {
    const map = new Map<string, { tasks: Task[]; sprints: Sprint[] }>()
    const mark = (d: Date) => d.toDateString()

    for (const t of tasks) {
      if (!t.dueDate) continue
      const day = mark(clampDate(toDate(t.dueDate)))
      const slot = map.get(day) ?? { tasks: [], sprints: [] }
      slot.tasks.push(t)
      map.set(day, slot)
    }

    for (const s of sprints) {
      const start = clampDate(toDate(s.startDate))
      const end = clampDate(toDate(s.endDate))
      // iterate each day of sprint (inclusive)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = mark(d)
        const slot = map.get(day) ?? { tasks: [], sprints: [] }
        slot.sprints.push(s)
        map.set(day, slot)
      }
    }
    return map
  }, [tasks, sprints])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const now = startOfDay(new Date())

  const gotoPrev = () => setCursor(new Date(year, month - 1, 1))
  const gotoNext = () => setCursor(new Date(year, month + 1, 1))
  const gotoToday = () => setCursor(startOfDay(new Date()))

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b bg-linear-to-br from-primary/10 via-background to-background p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl border bg-background px-3 py-2 text-sm font-medium">
            <span className="inline-flex items-center gap-2">
              <CalIcon className="h-4 w-4" />
              {MONTHS[month]} {year}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={month}
              onChange={(e) => setCursor(new Date(year, Number(e.target.value), 1))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={year}
              onChange={(e) => setCursor(new Date(Number(e.target.value), month, 1))}
            >
              {Array.from({ length: 11 }).map((_, i) => {
                const y = now.getFullYear() - 5 + i
                return <option key={y} value={y}>{y}</option>
              })}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={gotoPrev} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={gotoToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={gotoNext} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-background/70 px-4 py-3">
        <span className="text-xs text-muted-foreground">Legend:</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", "bg-primary/15 text-primary")}>Sprint</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", priorityClass("LOW"))}>Low</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", priorityClass("MEDIUM"))}>Medium</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", priorityClass("HIGH"))}>High</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", priorityClass("CRITICAL"))}>Critical</span>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="p-2 text-center">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px bg-border p-px">
        {grid.map((date) => {
          const inMonth = date.getMonth() === month
          const dayKey = date.toDateString()
          const slot = byDay.get(dayKey)
          const isToday = isSameDay(date, now)
          const isWeekend = [0, 6].includes(date.getDay())

          return (
            <div
              key={dayKey}
              className={cn(
                "min-h-32 bg-background p-2 transition-colors",
                !inMonth && "bg-muted/30 text-muted-foreground",
                isWeekend && inMonth && "bg-primary/5",
                "hover:bg-accent/30"
              )}
            >
              {/* Date corner */}
              <div className="mb-2 flex items-center justify-between">
                <div className={cn(
                  "text-sm font-semibold",
                  inMonth ? "" : "opacity-60"
                )}>
                  {date.getDate()}
                </div>
                {isToday && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <BadgeCheck className="h-3 w-3" /> Today
                  </span>
                )}
              </div>

              {/* Sprints (as soft gradient bars) */}
              <div className="space-y-1">
                {slot?.sprints.slice(0, 2).map((s) => (
                  <div
                    key={`${s.id}-${dayKey}`}
                    title={`${s.name} (${new Date(s.startDate).toLocaleDateString()} – ${new Date(s.endDate).toLocaleDateString()})`}
                    className={cn(
                      "truncate rounded-md px-2 py-1 text-[11px] font-medium shadow-sm",
                      "bg-linear-to-r",
                      sprintClass(s.status)
                    )}
                  >
                    {s.name}
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div className="mt-1 space-y-1">
                {slot?.tasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    title={`${t.project?.key ? `${t.project.key} – ` : ""}${t.title}`}
                    className={cn(
                      "truncate rounded-md px-2 py-0.5 text-[11px]",
                      "shadow-sm",
                      priorityClass(t.priority)
                    )}
                  >
                    {t.project?.key ? <strong>{t.project.key}</strong> : null}
                    {t.project?.key ? " · " : null}
                    {t.title}
                  </div>
                ))}
                {slot && slot.tasks.length > 3 && (
                  <div className="text-[11px] text-muted-foreground">
                    +{slot.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
