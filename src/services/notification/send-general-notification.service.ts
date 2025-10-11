import prisma from "../../prisma";

interface SendGeneralNotificationData {
  title: string;
  message: string;
  type: string;
  priority: string;
  target: string;
}

export const sendGeneralNotificationService = async (
  data: SendGeneralNotificationData
) => {
  try {
    let targetUsers: any[] = [];

    // Determine target users based on target parameter
    switch (data.target) {
      case "ALL":
        targetUsers = await prisma.user.findMany({
          where: { role: { in: ["CUSTOMER", "ADMIN", "STAFF"] } },
          select: { id: true, name: true, email: true, role: true },
        });
        break;
      case "ADMIN":
        targetUsers = await prisma.user.findMany({
          where: { role: { in: ["ADMIN", "STAFF"] } },
          select: { id: true, name: true, email: true, role: true },
        });
        break;
      case "CUSTOMER":
        targetUsers = await prisma.user.findMany({
          where: { role: "CUSTOMER" },
          select: { id: true, name: true, email: true, role: true },
        });
        break;
      default:
        throw new Error("Invalid target specified");
    }

    if (targetUsers.length === 0) {
      return { message: "No users found for the specified target" };
    }

    // Create notifications for all target users
    const notifications = targetUsers.map((user) => ({
      userId: user.id,
      title: data.title,
      message: data.message,
      description: data.message,
      type: data.type,
      priority: data.priority,
      data: JSON.stringify({
        target: data.target,
        sentBy: "admin",
        timestamp: new Date().toISOString(),
      }),
      isRead: false,
    }));

    // Bulk create notifications
    await prisma.notification.createMany({
      data: notifications,
    });

    return {
      message: "General notifications sent successfully",
      target: data.target,
      usersNotified: targetUsers.length,
      notificationsCreated: notifications.length,
    };
  } catch (error) {
    console.error("❌ General notification failed:", error);
    throw new Error("Failed to send general notifications");
  }
};
