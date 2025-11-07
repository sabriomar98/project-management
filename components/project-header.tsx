import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

interface ProjectHeaderProps {
  project: {
    name: string
    key: string
    description: string | null
    status: string
    startDate: Date | null
    endDate: Date | null
  }
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-lg">
                {project.key}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
              </div>
            </div>
          </div>
          <Badge
            variant={project.status === "ACTIVE" ? "default" : project.status === "COMPLETED" ? "secondary" : "outline"}
          >
            {project.status}
          </Badge>
        </div>
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            {project.startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Start: {new Date(project.startDate).toLocaleDateString()}
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                End: {new Date(project.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
