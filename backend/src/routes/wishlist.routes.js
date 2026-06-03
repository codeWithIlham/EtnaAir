const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const auth = authMiddleware;

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Logements favoris
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Lister les favoris
 *     tags: [Wishlist]
 *     responses:
 *       200:
 *         description: Liste des favoris
 */
router.get("/",                         auth, wishlistController.getMyWishlist);
router.get("/check/:propertyId",        auth, wishlistController.checkWishlist);
router.delete("/:propertyId",           auth, wishlistController.removeFromWishlist);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Ajouter un logement aux favoris
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, property_id]
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               property_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Ajouté aux favoris
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, wishlistController.addToWishlist);

module.exports = router;
