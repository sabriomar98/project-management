import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"
import { Card } from "@/components/ui/card"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  assignee: {
    id: string
    name: string | null
    image: string | null
  } | null
  labels: {
    id: string
    name: string
    color: string
  }[]
}

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex min-w-[300px] flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase text-muted-foreground">{title}</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {tasks.length}
        </span>
      </div>
      <Card ref={setNodeRef} className={`flex-1 p-2 transition-colors ${isOver ? "border-primary bg-primary/5" : ""}`}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">Drop tasks here</div>
            )}
          </div>
        </SortableContext>
      </Card>
    </div>
  )
}
