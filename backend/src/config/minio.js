const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint:  process.env.MINIO_ENDPOINT || "localhost",
  port:      parseInt(process.env.MINIO_PORT) || 9000,
  useSSL:    false,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET = process.env.MINIO_BUCKET || "etnair-images";

const initBucket = async () => {
  try {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
    console.log(`Bucket "${BUCKET}" créé`);
  }

  // Politique publique : GET sans authentification sur tous les objets
  const policy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Effect:    "Allow",
      Principal: { AWS: ["*"] },
      Action:    ["s3:GetObject"],
      Resource:  [`arn:aws:s3:::${BUCKET}/*`],
    }],
  });

    try {
      await minioClient.setBucketPolicy(BUCKET, policy);
      console.log(`Bucket "${BUCKET}" configuré en lecture publique`);
    } catch (err) {
      console.warn("Impossible de définir la politique du bucket :", err.message);
    }
  } catch (err) {
    console.warn("⚠️  MinIO non disponible, les uploads d'images seront désactivés :", err.message);
  }
};

module.exports = { minioClient, BUCKET, initBucket };
