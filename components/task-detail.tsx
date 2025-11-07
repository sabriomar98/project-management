"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommentList } from "@/components/comment-list"
import { CommentForm } from "@/components/comment-form"
import { AttachmentList } from "@/components/attachment-list"
import { AttachmentUpload } from "@/components/attachment-upload"
import { TaskActivityLog } from "@/components/task-activity-log"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Calendar, Clock, User, Tag, Flag } from "lucide-react"
import { format } from "date-fns"

interface TaskDetailProps {
  task: any
  userId: string
}

export function TaskDetail({ task, userId }: TaskDetailProps) {
  const [description, setDescription] = useState(task.description || "")
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const priorityColors = {
    LOW: "bg-blue-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500",
  }

  const statusColors = {
    TODO: "bg-gray-500",
    IN_PROGRESS: "bg-blue-500",
    IN_REVIEW: "bg-purple-500",
    DONE: "bg-green-500",
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {task.project.key}-{task.number}
                  </Badge>
                  <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <RichTextEditor content={description} onChange={setDescription} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setIsEditingDescription(false)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingDescription(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none cursor-pointer hover:bg-muted/50 p-2 rounded-md"
                  onClick={() => setIsEditingDescription(true)}
                  dangerouslySetInnerHTML={{ __html: description || "<p>Click to add description...</p>" }}
                />
              )}
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="comments">
              <TabsList>
                <TabsTrigger value="comments">Comments ({task.comments.length})</TabsTrigger>
                <TabsTrigger value="attachments">Attachments ({task.attachments.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="comments" className="space-y-4">
                <CommentForm taskId={task.id} />
                <CommentList comments={task.comments} userId={userId} />
              </TabsContent>
              <TabsContent value="attachments" className="space-y-4">
                <AttachmentUpload taskId={task.id} />
                <AttachmentList attachments={task.attachments} />
              </TabsContent>
              <TabsContent value="activity">
                <TaskActivityLog taskId={task.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assignee */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Assignee:</span>
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.image || ""} />
                    <AvatarFallback>{task.assignee.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </div>

            {/* Reporter */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Reporter:</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.reporter.image || ""} />
                  <AvatarFallback>{task.reporter.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{task.reporter.name}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Priority:</span>
              <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>{task.priority}</Badge>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Due Date:</span>
                <span className="text-sm">{format(new Date(task.dueDate), "PPP")}</span>
              </div>
            )}

            {/* Sprint */}
            {task.sprint && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sprint:</span>
                <span className="text-sm">{task.sprint.name}</span>
              </div>
            )}

            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Labels:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label: any) => (
                    <Badge key={label.id} style={{ backgroundColor: label.color }}>
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Created: {format(new Date(task.createdAt), "PPp")}</div>
              <div>Updated: {format(new Date(task.updatedAt), "PPp")}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
