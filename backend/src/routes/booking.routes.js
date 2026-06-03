const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Gestion des réservations
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Lister mes réservations
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations de l'utilisateur connecté
 *       401:
 *         description: Non authentifié
 */
router.get("/", authMiddleware, bookingController.getAllBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Détail d'une réservation
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de la réservation
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Réservation introuvable
 */
router.get("/:id", authMiddleware, bookingController.getBookingById);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Créer une réservation
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_id, start_date, end_date]
 *             properties:
 *               property_id:
 *                 type: integer
 *                 example: 2
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-05"
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Dates invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Logement introuvable
 */
router.post("/", authMiddleware, bookingController.createBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Annuler une réservation
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Réservation annulée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Réservation introuvable
 */
router.delete("/:id",        authMiddleware, bookingController.deleteBooking);
router.patch("/:id/status",  authMiddleware, bookingController.updateStatus);

module.exports = router;
