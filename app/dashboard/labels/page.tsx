import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LabelList } from "@/components/label-list"
import { CreateLabelDialog } from "@/components/create-label-dialog"

async function getLabels() {
  return await prisma.label.findMany({
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  })
}

export default async function LabelsPage() {
  const session = await auth()
  if (!session?.user) return null

  const labels = await getLabels()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Labels</h1>
        <CreateLabelDialog />
      </div>
      <LabelList labels={labels} />
    </div>
  )
}
