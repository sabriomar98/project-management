import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NotificationList } from "@/components/notification-list"

async function getNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) return null

  const notifications = await getNotifications(session.user.id)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationList notifications={notifications} />
    </div>
  )
}
