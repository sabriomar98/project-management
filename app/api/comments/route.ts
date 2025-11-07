import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, content } = await req.json()

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        taskId,
        userId: session.user.id,
        action: "COMMENT_ADDED",
        details: `Added a comment`,
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("[v0] Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
