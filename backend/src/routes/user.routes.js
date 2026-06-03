const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get("/", controller.getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer un utilisateur (direct, sans JWT)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Marie
 *               last_name:
 *                 type: string
 *                 example: Martin
 *               email:
 *                 type: string
 *                 example: marie.martin@email.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Utilisateur créé
 */
router.post("/", controller.createUser);

// Routes authentifiées
router.get("/me",              auth, controller.getMe);
router.put("/me",              auth, controller.updateProfile);
router.patch("/me/become-host",auth, controller.becomeHost);
router.get("/:id",             controller.getUserById);
router.patch("/:id/role",      auth, controller.updateRole);
router.delete("/:id",          auth, controller.deleteUser);

module.exports = router;
