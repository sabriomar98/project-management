import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import TeamsExplorer from "@/components/teams-explorer"

async function getTeamMembers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, image: true, createdAt: true },
    orderBy: { name: "asc" },
  })
}

export default async function TeamsPage() {
  const session = await auth()
  if (!session?.user) return null

  const members = await getTeamMembers()

  return (
    <div className="space-y-6">
      {/* Premium header */}
      <div className="rounded-2xl border bg-linear-to-br from-primary/10 via-background to-background p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">
              Manage your workspace roster, invite collaborators, and see who joined recently.
            </p>
          </div>
          <Button size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Explorer */}
      <TeamsExplorer
        members={members.map((m: { id: any; name: any; email: any; image: any; createdAt: { toISOString: () => any } }) => ({
          id: String(m.id),
          name: m.name ?? "",
          email: m.email,
          image: m.image ?? "",
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
