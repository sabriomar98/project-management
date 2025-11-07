import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { name, slug, description } = await req.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    })

    if (existingOrg) {
      return NextResponse.json({ error: "Organization slug already exists" }, { status: 400 })
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error("Create organization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
