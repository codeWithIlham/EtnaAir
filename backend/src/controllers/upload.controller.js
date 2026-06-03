const { minioClient, BUCKET } = require("../config/minio");
const prisma = require("../config/prisma");
const path = require("path");

// POST /upload — upload une image vers MinIO et enregistre en DB
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Aucun fichier envoyé" });
    }

    const ext      = path.extname(req.file.originalname).toLowerCase() || ".jpg";
    const fileName = `properties/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;

    await minioClient.putObject(BUCKET, fileName, req.file.buffer, req.file.size, {
      "Content-Type": req.file.mimetype,
    });

    // URL publique — utilise MINIO_PUBLIC_HOST (localhost) pas l'hostname Docker interne
    const publicHost = process.env.MINIO_PUBLIC_HOST || "localhost";
    const publicPort = process.env.MINIO_PORT || 9000;
    const imageUrl   = `http://${publicHost}:${publicPort}/${BUCKET}/${fileName}`;

    let record = null;
    if (req.body.property_id) {
      record = await prisma.propertyImage.create({
        data: {
          property_id: parseInt(req.body.property_id),
          image_url:   imageUrl,
          is_main:     req.body.is_main === "true",
        },
      });
    }

    res.status(201).json({
      success:   true,
      image_url: imageUrl,
      id:        record?.id || null,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /upload/:imageId — supprime une image de la DB (et de MinIO si possible)
exports.deleteImage = async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    const record  = await prisma.propertyImage.findUnique({ where: { id: imageId } });

    if (!record) {
      return res.status(404).json({ success: false, message: "Image introuvable" });
    }

    // Vérification : seul le propriétaire du logement peut supprimer
    const property = await prisma.property.findUnique({ where: { id: record.property_id } });
    if (property && property.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Non autorisé" });
    }

    // Supprimer de MinIO (best-effort — on continue si ça échoue)
    try {
      const url      = new URL(record.image_url);
      const filePath = url.pathname.replace(`/${BUCKET}/`, "");
      await minioClient.removeObject(BUCKET, filePath);
    } catch (minioErr) {
      console.warn("MinIO delete warning:", minioErr.message);
    }

    // Supprimer de la DB
    await prisma.propertyImage.delete({ where: { id: imageId } });

    res.status(200).json({ success: true, message: "Image supprimée" });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
