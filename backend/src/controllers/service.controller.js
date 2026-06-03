const svc = require("../services/service.service");

exports.getAll   = async (req, res) => {
  try { res.json(await svc.getAll(req.query)); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getById  = async (req, res) => {
  try { res.json(await svc.getById(parseInt(req.params.id))); }
  catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.create   = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis" });
    res.status(201).json(await svc.create(req.body));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.update   = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis" });
    res.json(await svc.update(parseInt(req.params.id), req.body));
  } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.delete   = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis" });
    await svc.delete(parseInt(req.params.id));
    res.json({ message: "Service supprimé" });
  } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.book     = async (req, res) => {
  try {
    const booking = await svc.bookService(req.user.id, parseInt(req.params.id), req.body);
    res.status(201).json(booking);
  } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.myBookings = async (req, res) => {
  try { res.json(await svc.getUserBookings(req.user.id)); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
