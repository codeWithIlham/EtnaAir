const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/upload.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté. Utilisez JPG, PNG ou WEBP."));
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Upload d'images vers MinIO
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Uploader une image pour un logement
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               property_id:
 *                 type: integer
 *                 example: 1
 *               is_main:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Image uploadée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 image_url:
 *                   type: string
 *       400:
 *         description: Aucun fichier envoyé
 *       500:
 *         description: Erreur serveur
 */
router.post("/",           authMiddleware, upload.single("image"), uploadController.uploadImage);
router.delete("/:imageId", authMiddleware,                         uploadController.deleteImage);

module.exports = router;
