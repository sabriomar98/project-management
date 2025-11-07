"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface Attachment {
  id: string
  name: string
  url: string
  size: number
  createdAt: string
}

interface AttachmentListProps {
  attachments: Attachment[]
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete attachment")
    },
    onSuccess: () => {
      toast({ title: "Attachment deleted" })
      queryClient.invalidateQueries({ queryKey: ["task"] })
    },
  })

  if (attachments.length === 0) {
    return <p className="text-sm text-muted-foreground">No attachments yet.</p>
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">
                {(attachment.size / 1024).toFixed(2)} KB • {format(new Date(attachment.createdAt), "PP")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" asChild>
              <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => deleteAttachment.mutate(attachment.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
