"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CommentListProps {
  comments: Comment[]
  userId: string
}

export function CommentList({ comments, userId }: CommentListProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete comment")
    },
    onSuccess: () => {
      toast({ title: "Comment deleted" })
      queryClient.invalidateQueries({ queryKey: ["task"] })
    },
  })

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet.</p>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.image || ""} />
            <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), "PPp")}</span>
              </div>
              {comment.user.id === userId && (
                <Button size="sm" variant="ghost" onClick={() => deleteComment.mutate(comment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
