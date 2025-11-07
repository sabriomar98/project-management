import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2 } from "lucide-react"

interface Sprint {
  id: string
  name: string
  goal: string | null
  startDate: Date
  endDate: Date
  status: string
  _count: {
    tasks: number
  }
}

interface SprintListProps {
  sprints: Sprint[]
}

export function SprintList({ sprints }: SprintListProps) {
  if (sprints.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sprints yet</h3>
          <p className="text-sm text-muted-foreground">Create your first sprint to start planning</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sprints.map((sprint) => (
        <Card key={sprint.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{sprint.name}</CardTitle>
              <Badge
                variant={
                  sprint.status === "ACTIVE" ? "default" : sprint.status === "COMPLETED" ? "secondary" : "outline"
                }
              >
                {sprint.status}
              </Badge>
            </div>
            {sprint.goal && <p className="text-sm text-muted-foreground">{sprint.goal}</p>}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {sprint._count.tasks} tasks
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
