require("dotenv").config();
const app    = require("./src/app");
const prisma = require("./src/config/prisma");
const { initBucket } = require("./src/config/minio");

const PORT = process.env.PORT || 3000;

async function runMigrations() {
  // Crée les tables services & service_bookings si elles n'existent pas
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "services" (
        "id"          SERIAL PRIMARY KEY,
        "title"       VARCHAR(255) NOT NULL,
        "description" TEXT,
        "category"    VARCHAR(50)  NOT NULL,
        "price"       DECIMAL(10,2) NOT NULL,
        "duration"    VARCHAR(50),
        "max_persons" INTEGER NOT NULL DEFAULT 10,
        "location"    VARCHAR(255),
        "image_url"   TEXT,
        "is_active"   BOOLEAN NOT NULL DEFAULT true,
        "provider"    VARCHAR(255),
        "rating"      DECIMAL(3,1),
        "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "service_bookings" (
        "id"          SERIAL PRIMARY KEY,
        "service_id"  INTEGER NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "user_id"     INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "date"        TIMESTAMP(3),
        "persons"     INTEGER NOT NULL DEFAULT 1,
        "total_price" DECIMAL(10,2) NOT NULL,
        "status"      VARCHAR(20) NOT NULL DEFAULT 'pending',
        "notes"       TEXT,
        "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Tables services & service_bookings OK");
  } catch (err) {
    console.warn("⚠️  Migration services:", err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 ETNAir API running on port ${PORT}`);
  await runMigrations();
  await initBucket();
});
