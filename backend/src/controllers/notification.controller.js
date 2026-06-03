const notificationService = require("../services/notification.service");

// GET /notifications — notifications de l'utilisateur connecté
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /notifications/:id/read — marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await notificationService.markAsRead(id, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /notifications/read-all — marquer toutes comme lues
exports.markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
