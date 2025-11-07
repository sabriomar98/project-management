import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, User } from "lucide-react"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  dueDate: Date | null
  assignee: {
    name: string | null
    image: string | null
  } | null
  labels: {
    id: string
    name: string
    color: string
  }[]
}

interface TaskListProps {
  tasks: Task[]
}

const statusColors = {
  TODO: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  IN_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

const priorityColors = {
  LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
          <p className="text-sm text-muted-foreground">Create your first task to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:border-primary transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{task.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                    {task.status.replace("_", " ")}
                  </Badge>
                  <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                    {task.priority}
                  </Badge>
                  {task.labels.map((label) => (
                    <Badge key={label.id} style={{ backgroundColor: label.color }} className="text-white">
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                {task.assignee && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.assignee.image || undefined} />
                    <AvatarFallback>{task.assignee.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
