import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { name, goal, startDate, endDate, projectId } = await req.json()

    if (!name || !startDate || !endDate || !projectId) {
      return NextResponse.json({ error: "Name, start date, end date, and project are required" }, { status: 400 })
    }

    // Check if user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 })
    }

    const sprint = await prisma.sprint.create({
      data: {
        name,
        goal,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        projectId,
      },
    })

    return NextResponse.json(sprint, { status: 201 })
  } catch (error) {
    console.error("Create sprint error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
