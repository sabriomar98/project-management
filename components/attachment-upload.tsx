"use client"

import { UploadButton } from "@/lib/uploadthing"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface AttachmentUploadProps {
  taskId: string
}

export function AttachmentUpload({ taskId }: AttachmentUploadProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return (
    <UploadButton
      endpoint="taskAttachment"
      onClientUploadComplete={(res) => {
        toast({ title: "File uploaded successfully" })
        queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      }}
      onUploadError={(error: Error) => {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" })
      }}
    />
  )
}
