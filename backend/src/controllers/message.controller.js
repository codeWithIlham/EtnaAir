const messageService = require("../services/message.service");

// GET /messages — messages de l'utilisateur connecté (envoyés + reçus)
exports.getMessages = async (req, res) => {
  try {
    const messages = await messageService.getMessages(req.user.id);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /messages — l'expéditeur est automatiquement l'utilisateur connecté
exports.sendMessage = async (req, res) => {
  try {
    const message = await messageService.sendMessage(req.user.id, req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
