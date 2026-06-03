const service = require("../services/user.service");

exports.createUser = async (req, res) => {
  try { res.json(await service.createUser(req.body)); }
  catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.getUsers = async (req, res) => {
  try { res.json(await service.getUsers()); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getUserById = async (req, res) => {
  try { res.json(await service.getUserById(parseInt(req.params.id))); }
  catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.getMe = async (req, res) => {
  try { res.json(await service.getUserById(req.user.id)); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try { res.json(await service.updateProfile(req.user.id, req.body)); }
  catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.updateRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis" });
    res.json(await service.updateRole(parseInt(req.params.id), req.body.role));
  } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

// PATCH /users/me/become-host — tout utilisateur peut devenir hôte
exports.becomeHost = async (req, res) => {
  try {
    if (req.user.role === 'host' || req.user.role === 'admin') {
      return res.status(400).json({ message: "Vous êtes déjà hôte." });
    }
    const updated = await service.updateRole(req.user.id, 'host');
    // Générer un nouveau JWT avec le rôle mis à jour
    const { generateToken } = require('../../utils/jwt');
    const newToken = generateToken({ id: updated.id, email: updated.email, role: updated.role });
    res.json({ user: updated, token: newToken });
  } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis" });
    await service.deleteUser(parseInt(req.params.id));
    res.json({ message: "Utilisateur supprimé" });
  } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};