"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"
import { format } from "date-fns"

interface Member {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
}

interface TeamListProps {
  members: Member[]
}

export function TeamList({ members }: TeamListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.image || ""} />
                <AvatarFallback>{member.name?.[0] || member.email[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold">{member.name || "Unnamed User"}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Member</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Joined {format(new Date(member.createdAt), "PP")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
