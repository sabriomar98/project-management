import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const labels = await prisma.label.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(labels)
  } catch (error) {
    console.error("[v0] Error fetching labels:", error)
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await req.json()

    const label = await prisma.label.create({
      data: {
        name,
        color,
      },
    })

    return NextResponse.json(label)
  } catch (error) {
    console.error("[v0] Error creating label:", error)
    return NextResponse.json({ error: "Failed to create label" }, { status: 500 })
  }
}
