const prisma = require("../config/prisma");

exports.getAll = async (filters = {}) => {
  const where = { is_active: true };
  if (filters.category) where.category = filters.category;
  return prisma.service.findMany({
    where,
    orderBy: [{ rating: "desc" }, { created_at: "desc" }],
  });
};

exports.getById = async (id) => {
  const s = await prisma.service.findUnique({ where: { id } });
  if (!s) { const e = new Error("Service introuvable"); e.status = 404; throw e; }
  return s;
};

exports.create = async (data) => prisma.service.create({ data });

exports.update = async (id, data) => {
  const s = await prisma.service.findUnique({ where: { id } });
  if (!s) { const e = new Error("Service introuvable"); e.status = 404; throw e; }
  return prisma.service.update({ where: { id }, data });
};

exports.delete = async (id) => {
  await prisma.service.findUnique({ where: { id } });
  return prisma.service.delete({ where: { id } });
};

// ── Réservations de services ──
exports.bookService = async (userId, serviceId, data) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) { const e = new Error("Service introuvable"); e.status = 404; throw e; }
  const persons = parseInt(data.persons) || 1;
  const total   = parseFloat(service.price) * persons;
  return prisma.serviceBooking.create({
    data: {
      service_id:  serviceId,
      user_id:     userId,
      date:        data.date ? new Date(data.date) : null,
      persons,
      total_price: total,
      notes:       data.notes || null,
      status:      "pending",
    },
    include: { service: true },
  });
};

exports.getUserBookings = async (userId) =>
  prisma.serviceBooking.findMany({
    where:   { user_id: userId },
    include: { service: true },
    orderBy: { created_at: "desc" },
  });
