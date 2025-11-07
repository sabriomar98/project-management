import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const { status, priority, assigneeId, sprintId, title, description } = await req.json()

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          organization: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId
    if (sprintId !== undefined) updateData.sprintId = sprintId
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          organization: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
