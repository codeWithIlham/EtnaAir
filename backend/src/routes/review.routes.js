const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Gestion des avis
 */

/**
 * @swagger
 * /reviews/property/{id}:
 *   get:
 *     summary: Lister les avis d'un logement
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du logement
 *     responses:
 *       200:
 *         description: Liste des avis
 *       404:
 *         description: Logement introuvable
 */
router.get("/property/:id", reviewController.getReviewsByProperty);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Publier un avis
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_id, booking_id, rating]
 *             properties:
 *               property_id:
 *                 type: integer
 *                 example: 1
 *               booking_id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent séjour, très propre !
 *     responses:
 *       201:
 *         description: Avis publié
 *       400:
 *         description: Données invalides (rating hors limites, booking_id manquant)
 *       401:
 *         description: Non authentifié
 */
router.post("/", authMiddleware, reviewController.createReview);

module.exports = router;
