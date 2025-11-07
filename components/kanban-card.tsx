import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, GripVertical } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
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

interface KanbanCardProps {
  task: Task
  isDragging?: boolean
}

const priorityColors = {
  LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

export function KanbanCard({ task, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "shadow-lg" : ""}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>{task.priority}</Badge>
          {task.labels.map((label) => (
            <Badge key={label.id} style={{ backgroundColor: label.color }} className="text-white text-xs">
              {label.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.assignee && (
            <Avatar className="h-6 w-6 ml-auto">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-xs">{task.assignee.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
