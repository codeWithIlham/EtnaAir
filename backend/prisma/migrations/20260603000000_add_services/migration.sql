-- Migration: add services & service_bookings tables

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
);

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
);
