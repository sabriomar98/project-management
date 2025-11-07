import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const { status, priority, assigneeId, sprintId, title, description } = await req.json()

    // Check if user has access to the task's project
    const task = await sql`
      SELECT t.* FROM tasks t
      JOIN projects p ON t."projectId" = p.id
      JOIN organizations o ON p."organizationId" = o.id
      JOIN organization_members om ON o.id = om."organizationId"
      WHERE t.id = ${params.id} AND om."userId" = ${user.id}
    `

    if (task.length === 0) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (status) {
      updates.push(`status = $${updates.length + 1}`)
      values.push(status)
    }
    if (priority) {
      updates.push(`priority = $${updates.length + 1}`)
      values.push(priority)
    }
    if (assigneeId !== undefined) {
      updates.push(`"assigneeId" = $${updates.length + 1}`)
      values.push(assigneeId)
    }
    if (sprintId !== undefined) {
      updates.push(`"sprintId" = $${updates.length + 1}`)
      values.push(sprintId)
    }
    if (title) {
      updates.push(`title = $${updates.length + 1}`)
      values.push(title)
    }
    if (description !== undefined) {
      updates.push(`description = $${updates.length + 1}`)
      values.push(description)
    }

    if (updates.length === 0) {
      return NextResponse.json(task[0])
    }

    const updatedTask = await sql`
      UPDATE tasks 
      SET ${sql(updates.join(", "))}, "updatedAt" = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    return NextResponse.json(updatedTask[0])
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()

    // Check if user has access to the task's project
    const task = await sql`
      SELECT t.* FROM tasks t
      JOIN projects p ON t."projectId" = p.id
      JOIN organizations o ON p."organizationId" = o.id
      JOIN organization_members om ON o.id = om."organizationId"
      WHERE t.id = ${params.id} AND om."userId" = ${user.id}
    `

    if (task.length === 0) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    await sql`DELETE FROM tasks WHERE id = ${params.id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
