const wishlistService = require("../services/wishlist.service");

exports.getMyWishlist = async (req, res) => {
  try {
    const items = await wishlistService.getMyWishlist(req.user.id);
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { property_id } = req.body;
    if (!property_id) return res.status(400).json({ message: "property_id requis" });
    const item = await wishlistService.addToWishlist(req.user.id, parseInt(property_id));
    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await wishlistService.removeFromWishlist(req.user.id, parseInt(req.params.propertyId));
    res.json({ message: "Retiré des favoris" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.checkWishlist = async (req, res) => {
  try {
    const liked = await wishlistService.isInWishlist(req.user.id, parseInt(req.params.propertyId));
    res.json({ liked });
  } catch (e) { res.status(500).json({ message: e.message }); }
};