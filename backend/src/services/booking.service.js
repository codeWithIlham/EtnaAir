const prisma = require("../config/prisma");

exports.getAllBookings = async (userId, role) => {
  const where = role === "admin" ? {} : { guest_id: userId };
  return prisma.booking.findMany({
    where,
    include: { property: { include: { owner: true } }, guest: true },
    orderBy: { created_at: "desc" },
  });
};

exports.getBookingById = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: { include: { owner: true } }, guest: true },
  });
  if (!booking) {
    const err = new Error("Booking not found");
    err.status = 404;
    throw err;
  }
  return booking;
};

exports.createBooking = async (data, guestId) => {
  const start = new Date(data.start_date);
  const end   = new Date(data.end_date);

  if (isNaN(start) || isNaN(end)) {
    const err = new Error("Invalid dates"); err.status = 400; throw err;
  }
  if (end <= start) {
    const err = new Error("End date must be after start date"); err.status = 400; throw err;
  }

  const property = await prisma.property.findUnique({
    where:   { id: data.property_id },
    include: { owner: true },
  });
  if (!property) {
    const err = new Error("Property not found"); err.status = 404; throw err;
  }

  const nights      = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const total_price = parseFloat(property.price_per_night) * nights;
  const fmtDate     = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  const booking = await prisma.booking.create({
    data: {
      guest_id:   guestId,
      property_id: data.property_id,
      start_date:  start,
      end_date:    end,
      total_price,
    },
  });

  // ── Notifier l'hôte ─────────────────────────────────────
  if (property.owner_id) {
    await prisma.notification.create({
      data: {
        user_id: property.owner_id,
        title:   "📅 Nouvelle réservation reçue",
        content: `Un voyageur vient de réserver "${property.title}" du ${fmtDate(start)} au ${fmtDate(end)} · ${total_price.toFixed(0)} €`,
        is_read: false,
      },
    }).catch(() => {}); // silencieux si la table n'existe pas encore
  }

  // ── Notifier le voyageur (confirmation) ─────────────────
  await prisma.notification.create({
    data: {
      user_id: guestId,
      title:   "🎉 Réservation envoyée !",
      content: `Votre demande pour "${property.title}" est en attente de confirmation de l'hôte.`,
      is_read: false,
    },
  }).catch(() => {});

  return booking;
};

exports.deleteBooking = async (id) => {
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Booking not found"); err.status = 404; throw err;
  }
  return prisma.booking.delete({ where: { id } });
};

exports.updateStatus = async (id, status, userId, role) => {
  const valid = ["pending", "confirmed", "cancelled", "completed", "refunded"];
  if (!valid.includes(status)) {
    const e = new Error("Statut invalide"); e.status = 400; throw e;
  }
  const booking = await prisma.booking.findUnique({
    where:   { id },
    include: { property: { include: { owner: true } }, guest: true },
  });
  if (!booking) { const e = new Error("Booking not found"); e.status = 404; throw e; }

  const isOwner = booking.property.owner_id === userId;
  const isGuest = booking.guest_id === userId;
  if (!isOwner && !isGuest && role !== "admin") {
    const e = new Error("Non autorisé"); e.status = 403; throw e;
  }
  if (isGuest && status !== "cancelled") {
    const e = new Error("Vous pouvez seulement annuler"); e.status = 403; throw e;
  }

  await prisma.booking.update({ where: { id }, data: { booking_status: status } });

  // ── Notifier le voyageur du changement de statut ────────
  const statusLabels = {
    confirmed: "✅ Votre réservation a été confirmée",
    cancelled:  "❌ Votre réservation a été annulée",
    completed:  "🏁 Votre séjour est marqué comme terminé",
    refunded:   "💸 Votre réservation a été remboursée",
  };
  if (statusLabels[status] && booking.guest_id) {
    await prisma.notification.create({
      data: {
        user_id: booking.guest_id,
        title:   statusLabels[status],
        content: `Logement : "${booking.property.title}" · ${total_price(booking)} €`,
        is_read: false,
      },
    }).catch(() => {});
  }

  return prisma.booking.findUnique({
    where:   { id },
    include: { property: { include: { owner: true } }, guest: true },
  });
};

function total_price(booking) {
  return parseFloat(booking.total_price || 0).toFixed(0);
}
