const prisma = require("../config/prisma");

exports.getMyWishlist = async (userId) => {
  return prisma.wishlist.findMany({
    where: { user_id: userId },
    include: { property: { include: { images: true, owner: true } } },
    orderBy: { created_at: "desc" },
  });
};

exports.addToWishlist = async (userId, propertyId) => {
  const existing = await prisma.wishlist.findFirst({
    where: { user_id: userId, property_id: propertyId },
  });
  if (existing) return existing;
  return prisma.wishlist.create({ data: { user_id: userId, property_id: propertyId } });
};

exports.removeFromWishlist = async (userId, propertyId) => {
  return prisma.wishlist.deleteMany({
    where: { user_id: userId, property_id: propertyId },
  });
};

exports.isInWishlist = async (userId, propertyId) => {
  const item = await prisma.wishlist.findFirst({
    where: { user_id: userId, property_id: propertyId },
  });
  return !!item;
};
