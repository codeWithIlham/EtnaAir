const prisma = require("../config/prisma");

exports.getReviewsByProperty = async (propertyId) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    const err = new Error("Property not found");
    err.status = 404;
    throw err;
  }
  return prisma.review.findMany({
    where: { property_id: propertyId },
    include: { reviewer: true },
  });
};

exports.createReview = async (data) => {
  return prisma.review.create({
    data: {
      booking_id: data.booking_id,
      reviewer_id: data.reviewer_id,
      property_id: data.property_id,
      rating: data.rating,
      comment: data.comment,
    },
  });
};
