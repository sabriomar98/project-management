import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { name, key, description, organizationId } = await req.json()

    if (!name || !key || !organizationId) {
      return NextResponse.json({ error: "Name, key, and organization are required" }, { status: 400 })
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this organization" }, { status: 403 })
    }

    const existingProject = await prisma.project.findUnique({
      where: {
        organizationId_key: {
          organizationId,
          key: key.toUpperCase(),
        },
      },
    })

    if (existingProject) {
      return NextResponse.json({ error: "Project key already exists in this organization" }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description,
        organizationId,
        status: "PLANNING",
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
