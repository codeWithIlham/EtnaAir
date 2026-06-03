const prisma = require("../config/prisma");

// Récupère uniquement les messages où l'utilisateur est expéditeur OU destinataire
exports.getMessages = async (userId) => {
  return prisma.message.findMany({
    where: {
      OR: [
        { sender_id:   userId },
        { receiver_id: userId },
      ],
    },
    include: { sender: true, receiver: true, property: true },
    orderBy: { created_at: "desc" },
  });
};

// Envoie un message — l'expéditeur est l'utilisateur connecté
exports.sendMessage = async (senderId, data) => {
  return prisma.message.create({
    data: {
      sender_id:   senderId,
      receiver_id: data.receiver_id,
      property_id: data.property_id || null,
      content:     data.content,
    },
    include: { sender: true, receiver: true, property: true },
  });
};
