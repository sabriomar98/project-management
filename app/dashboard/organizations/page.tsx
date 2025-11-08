import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog"
import OrganizationsExplorer from "@/components/organizations-explorer"

export default async function OrganizationsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const organizations = await prisma.organization.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      _count: { select: { members: true, projects: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      {/* Premium header */}
      <div className="rounded-2xl border bg-linear-to-br from-primary/10 via-background to-background p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage workspaces, members, and projects across your orgs.
            </p>
          </div>
          <CreateOrganizationDialog>
            <Button size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          </CreateOrganizationDialog>
        </div>
      </div>

      <OrganizationsExplorer
        orgs={organizations.map((o: { id: any; name: any; slug: any; createdAt: { toISOString: () => any }; _count: { members: any; projects: any } }) => ({
          id: String(o.id),
          name: o.name,
          slug: o.slug,
          createdAt: o.createdAt.toISOString(),
          counts: { members: o._count.members, projects: o._count.projects },
        }))}
      />
    </div>
  )
}
