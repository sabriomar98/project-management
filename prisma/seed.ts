import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create demo users
  const password = await hash("password123", 12)

  const user1 = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: "developer@example.com" },
    update: {},
    create: {
      email: "developer@example.com",
      name: "Developer User",
      password,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: "designer@example.com" },
    update: {},
    create: {
      email: "designer@example.com",
      name: "Designer User",
      password,
    },
  })

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
      description: "Demo organization for testing",
      createdById: user1.id,
    },
  })

  // Add members to organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user1.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user1.id,
      role: "OWNER",
    },
  })

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user2.id,
      role: "MEMBER",
    },
  })

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user3.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user3.id,
      role: "MEMBER",
    },
  })

  // Create demo project
  const project = await prisma.project.upsert({
    where: {
      organizationId_key: {
        organizationId: org.id,
        key: "DEMO",
      },
    },
    update: {},
    create: {
      name: "Demo Project",
      key: "DEMO",
      description: "A demo project for testing the application",
      status: "ACTIVE",
      organizationId: org.id,
      startDate: new Date(),
    },
  })

  // Create labels
  const bugLabel = await prisma.label.create({
    data: {
      name: "Bug",
      color: "#ef4444",
      projectId: project.id,
    },
  })

  const featureLabel = await prisma.label.create({
    data: {
      name: "Feature",
      color: "#3b82f6",
      projectId: project.id,
    },
  })

  const improvementLabel = await prisma.label.create({
    data: {
      name: "Improvement",
      color: "#10b981",
      projectId: project.id,
    },
  })

  // Create sprint
  const sprint = await prisma.sprint.create({
    data: {
      name: "Sprint 1",
      goal: "Complete initial features",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      status: "ACTIVE",
      projectId: project.id,
    },
  })

  // Create tasks
  await prisma.task.create({
    data: {
      title: "Setup project infrastructure",
      description: "Initialize the project with Next.js, Prisma, and authentication",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 5,
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: user1.id,
      createdById: user1.id,
      position: 0,
      labels: {
        connect: [{ id: featureLabel.id }],
      },
    },
  })

  await prisma.task.create({
    data: {
      title: "Design user interface",
      description: "Create mockups and design system for the application",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 8,
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: user3.id,
      createdById: user1.id,
      position: 1,
      labels: {
        connect: [{ id: featureLabel.id }],
      },
    },
  })

  await prisma.task.create({
    data: {
      title: "Implement authentication",
      description: "Add email/password and OAuth authentication",
      status: "IN_PROGRESS",
      priority: "URGENT",
      storyPoints: 5,
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: user2.id,
      createdById: user1.id,
      position: 2,
      labels: {
        connect: [{ id: featureLabel.id }],
      },
    },
  })

  await prisma.task.create({
    data: {
      title: "Build kanban board",
      description: "Create drag-and-drop kanban board for task management",
      status: "TODO",
      priority: "HIGH",
      storyPoints: 8,
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: user2.id,
      createdById: user1.id,
      position: 3,
      labels: {
        connect: [{ id: featureLabel.id }],
      },
    },
  })

  await prisma.task.create({
    data: {
      title: "Fix responsive layout issues",
      description: "Some components are not displaying correctly on mobile devices",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 3,
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: user3.id,
      createdById: user2.id,
      position: 4,
      labels: {
        connect: [{ id: bugLabel.id }],
      },
    },
  })

  await prisma.task.create({
    data: {
      title: "Add real-time notifications",
      description: "Implement Pusher for real-time updates",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 5,
      projectId: project.id,
      assigneeId: user2.id,
      createdById: user1.id,
      position: 5,
      labels: {
        connect: [{ id: featureLabel.id }],
      },
    },
  })

  await prisma.task.create({
    data: {
      title: "Optimize database queries",
      description: "Add indexes and optimize slow queries",
      status: "TODO",
      priority: "LOW",
      storyPoints: 3,
      projectId: project.id,
      createdById: user1.id,
      position: 6,
      labels: {
        connect: [{ id: improvementLabel.id }],
      },
    },
  })

  console.log("Seed completed successfully!")
  console.log("\nDemo credentials:")
  console.log("Email: admin@example.com")
  console.log("Password: password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
