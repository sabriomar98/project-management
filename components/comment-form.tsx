"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface CommentFormProps {
  taskId: string
}

export function CommentForm({ taskId }: CommentFormProps) {
  const [content, setContent] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createComment = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, ...data }),
      })
      if (!res.ok) throw new Error("Failed to create comment")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Comment added successfully" })
      setContent("")
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createComment.mutate({ content })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea placeholder="Add a comment..." value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
      <Button type="submit" disabled={!content.trim() || createComment.isPending}>
        {createComment.isPending ? "Adding..." : "Add Comment"}
      </Button>
    </form>
  )
}
