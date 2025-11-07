let prisma: any

try {
  // Try to import PrismaClient (works locally after `npx prisma generate`)
  const { PrismaClient } = require("@prisma/client")

  const globalForPrisma = globalThis as unknown as {
    prisma: any | undefined
  }

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["query", "error", "warn"],
    })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
} catch (error) {
  // Fallback for v0 preview environment where Prisma Client is not generated
  console.log("[v0] Using mock Prisma Client for preview")

  prisma = {
    user: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ id: "mock-id", ...data.data }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      delete: async (data: any) => ({ id: data.where.id }),
      count: async () => 0,
    },
    organization: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => ({ id: "mock-org-id", ...data.data, createdAt: new Date(), updatedAt: new Date() }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      delete: async (data: any) => ({ id: data.where.id }),
      count: async () => 0,
    },
    project: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => ({
        id: "mock-project-id",
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      delete: async (data: any) => ({ id: data.where.id }),
      count: async () => 0,
    },
    task: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => ({ id: "mock-task-id", ...data.data, createdAt: new Date(), updatedAt: new Date() }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      delete: async (data: any) => ({ id: data.where.id }),
      count: async () => 0,
    },
    sprint: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => ({
        id: "mock-sprint-id",
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      delete: async (data: any) => ({ id: data.where.id }),
    },
    comment: {
      findMany: async () => [],
      create: async (data: any) => ({
        id: "mock-comment-id",
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      delete: async (data: any) => ({ id: data.where.id }),
    },
    notification: {
      findMany: async () => [],
      create: async (data: any) => ({ id: "mock-notification-id", ...data.data, createdAt: new Date() }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      count: async () => 0,
    },
    label: {
      findMany: async () => [],
      create: async (data: any) => ({ id: "mock-label-id", ...data.data }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      delete: async (data: any) => ({ id: data.where.id }),
    },
    attachment: {
      findMany: async () => [],
      create: async (data: any) => ({ id: "mock-attachment-id", ...data.data, createdAt: new Date() }),
      delete: async (data: any) => ({ id: data.where.id }),
    },
    activityLog: {
      create: async (data: any) => ({ id: "mock-activity-id", ...data.data, createdAt: new Date() }),
      findMany: async () => [],
    },
    $transaction: async (callback: any) => {
      return callback(prisma)
    },
  }
}

export { prisma }
