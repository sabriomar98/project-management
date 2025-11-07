import { neon } from "@neondatabase/serverless"

// Use Neon SQL client directly instead of Prisma
export const sql = neon(process.env.DATABASE_URL!)

// Helper types matching our schema
export type User = {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  password: string | null
  locale: string
  theme: string
  createdAt: Date
  updatedAt: Date
}

export type Organization = {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  createdAt: Date
  updatedAt: Date
  createdById: string
}

export type Project = {
  id: string
  name: string
  key: string
  description: string | null
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
  startDate: Date | null
  endDate: Date | null
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export type Sprint = {
  id: string
  name: string
  goal: string | null
  startDate: Date
  endDate: Date
  status: "PLANNED" | "ACTIVE" | "COMPLETED"
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  storyPoints: number | null
  dueDate: Date | null
  projectId: string
  sprintId: string | null
  assigneeId: string | null
  createdById: string
  parentId: string | null
  position: number
  createdAt: Date
  updatedAt: Date
}
