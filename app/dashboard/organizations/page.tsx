import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, Users } from "lucide-react"
import Link from "next/link"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog"

export default async function OrganizationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const organizations = await sql`
    SELECT o.*,
           (SELECT COUNT(*)::int FROM organization_members WHERE "organizationId" = o.id) as member_count,
           (SELECT COUNT(*)::int FROM projects WHERE "organizationId" = o.id) as project_count
    FROM organizations o
    JOIN organization_members om ON o.id = om."organizationId"
    WHERE om."userId" = ${user.id}
    ORDER BY o."createdAt" DESC
  `

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage your organizations and their projects</p>
        </div>
        <CreateOrganizationDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </CreateOrganizationDialog>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first organization to get started</p>
            <CreateOrganizationDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </CreateOrganizationDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org: any) => (
            <Link key={org.id} href={`/dashboard/organizations/${org.slug}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{org.name}</CardTitle>
                      <CardDescription className="truncate">@{org.slug}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {org.member_count} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {org.project_count} projects
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
