import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TeamList } from "@/components/team-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

async function getTeamMembers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
    orderBy: {
      name: "asc",
    },
  })
}

export default async function TeamsPage() {
  const session = await auth()
  if (!session?.user) return null

  const members = await getTeamMembers()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>
      <TeamList members={members} />
    </div>
  )
}
