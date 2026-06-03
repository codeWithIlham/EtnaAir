const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const controller = require("../controllers/property.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const createPropertyRules = [
  body("title").trim().notEmpty().withMessage("Le titre est obligatoire"),
  body("description").trim().notEmpty().withMessage("La description est obligatoire"),
  body("price_per_night").isFloat({ min: 1 }).withMessage("Le prix doit être un nombre positif"),
  body("max_guests").isInt({ min: 1 }).withMessage("La capacité doit être un entier positif"),
  body("property_type").optional().isIn(["studio", "apartment", "house", "villa"]).withMessage("Type invalide"),
];

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Gestion des logements
 */

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Lister tous les logements
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Liste des logements
 */
router.get("/", controller.getAllProperties);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Récupérer un logement par ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du logement
 *       404:
 *         description: Logement introuvable
 */
router.get("/:id", controller.getPropertyById);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Créer un nouveau logement
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [owner_id, title, description, price_per_night, max_guests]
 *             properties:
 *               owner_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: Appartement cosy Paris centre
 *               description:
 *                 type: string
 *                 example: Bel appartement au coeur de Paris
 *               price_per_night:
 *                 type: number
 *                 example: 85.00
 *               property_type:
 *                 type: string
 *                 example: apartment
 *               max_guests:
 *                 type: integer
 *                 example: 4
 *               city:
 *                 type: string
 *                 example: Paris
 *               country:
 *                 type: string
 *                 example: France
 *     responses:
 *       201:
 *         description: Logement créé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware, createPropertyRules, validate, controller.createProperty);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Mettre à jour un logement
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price_per_night:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logement mis à jour
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", authMiddleware, controller.updateProperty);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Supprimer un logement
 *     tags: [Properties]
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
 *         description: Logement supprimé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", authMiddleware, controller.deleteProperty);

module.exports = router;
