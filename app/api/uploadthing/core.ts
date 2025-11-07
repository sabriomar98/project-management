import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const f = createUploadthing()

export const ourFileRouter = {
  taskAttachment: f({ image: { maxFileSize: "4MB" }, pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.attachment.create({
        data: {
          name: file.name,
          url: file.url,
          size: file.size,
          taskId: "task-id", // This should come from the upload context
        },
      })
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
