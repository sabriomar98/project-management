"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface Label {
  id: string
  name: string
  color: string
  _count: {
    tasks: number
  }
}

interface LabelListProps {
  labels: Label[]
}

export function LabelList({ labels }: LabelListProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteLabel = useMutation({
    mutationFn: async (labelId: string) => {
      const res = await fetch(`/api/labels/${labelId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete label")
    },
    onSuccess: () => {
      toast({ title: "Label deleted successfully" })
      queryClient.invalidateQueries({ queryKey: ["labels"] })
    },
    onError: () => {
      toast({ title: "Failed to delete label", variant: "destructive" })
    },
  })

  if (labels.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No labels created yet. Create your first label to organize tasks.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {labels.map((label) => (
        <Card key={label.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge style={{ backgroundColor: label.color }}>{label.name}</Badge>
              <span className="text-sm text-muted-foreground">
                {label._count.tasks} task{label._count.tasks !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteLabel.mutate(label.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
