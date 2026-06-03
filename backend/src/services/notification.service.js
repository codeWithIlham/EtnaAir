const prisma = require("../config/prisma");

exports.getNotifications = async (userId) => {
  return prisma.notification.findMany({
    where:   { user_id: userId },
    orderBy: { created_at: "desc" },
  });
};

exports.markAsRead = async (id, userId) => {
  return prisma.notification.updateMany({
    where: { id, user_id: userId },
    data:  { is_read: true },
  });
};

exports.markAllRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data:  { is_read: true },
  });
};
