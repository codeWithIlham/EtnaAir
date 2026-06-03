const prisma = require("../config/prisma");

exports.getAllProperties = async (filters = {}) => {
  const where = {};
  if (filters.city)           where.city           = { contains: filters.city, mode: "insensitive" };
  if (filters.max_price)      where.price_per_night = { lte: parseFloat(filters.max_price) };
  if (filters.min_price)      where.price_per_night = { ...where.price_per_night, gte: parseFloat(filters.min_price) };
  if (filters.property_type)  where.property_type   = filters.property_type;
  if (filters.min_guests)     where.max_guests      = { gte: parseInt(filters.min_guests) };

  // Pagination
  const page  = Math.max(1, parseInt(filters.page)  || 1);
  const limit = Math.min(50, parseInt(filters.limit) || 12);
  const skip  = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { owner: true, images: true },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  // Retourne le tableau + meta pour les headers (compatibilité descendante)
  data._pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };

  return data;
};

exports.getPropertyById = async (id) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { owner: true, images: true, amenities: true },
  });
  if (!property) {
    const err = new Error("Property not found");
    err.status = 404;
    throw err;
  }
  return property;
};

exports.createProperty = async (data) => {
  return prisma.property.create({ data });
};

exports.updateProperty = async (id, data) => {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Property not found");
    err.status = 404;
    throw err;
  }
  return prisma.property.update({ where: { id }, data });
};

exports.deleteProperty = async (id) => {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Property not found");
    err.status = 404;
    throw err;
  }
  return prisma.property.delete({ where: { id } });
};
