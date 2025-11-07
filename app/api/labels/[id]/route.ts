import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.label.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting label:", error)
    return NextResponse.json({ error: "Failed to delete label" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await req.json()

    const label = await prisma.label.update({
      where: { id: params.id },
      data: {
        name,
        color,
      },
    })

    return NextResponse.json(label)
  } catch (error) {
    console.error("[v0] Error updating label:", error)
    return NextResponse.json({ error: "Failed to update label" }, { status: 500 })
  }
}
