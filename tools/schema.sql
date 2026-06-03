CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" text NOT NULL,
  "phone_number" varchar(20),
  "profile_picture" text,
  "bio" text,
  "role" varchar(20) DEFAULT 'guest',
  "is_verified" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "properties" (
  "id" SERIAL PRIMARY KEY,
  "owner_id" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "price_per_night" decimal(10,2) NOT NULL,
  "property_type" varchar(50),
  "max_guests" integer NOT NULL,
  "bedrooms" integer DEFAULT 1,
  "bathrooms" integer DEFAULT 1,
  "country" varchar(100),
  "city" varchar(100),
  "address" text,
  "latitude" decimal(9,6),
  "longitude" decimal(9,6),
  "status" varchar(20) DEFAULT 'active',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "property_images" (
  "id" SERIAL PRIMARY KEY,
  "property_id" integer NOT NULL,
  "image_url" text NOT NULL,
  "is_main" boolean DEFAULT false
);

CREATE TABLE "bookings" (
  "id" SERIAL PRIMARY KEY,
  "guest_id" integer NOT NULL,
  "property_id" integer NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "total_price" decimal(10,2) NOT NULL,
  "booking_status" varchar(20) DEFAULT 'pending',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "reviews" (
  "id" SERIAL PRIMARY KEY,
  "booking_id" integer,
  "reviewer_id" integer,
  "property_id" integer,
  "rating" integer,
  "comment" text,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "amenities" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "property_amenities" (
  "property_id" integer,
  "amenity_id" integer,
  PRIMARY KEY ("property_id", "amenity_id")
);

CREATE TABLE "wishlists" (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer,
  "property_id" integer,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "messages" (
  "id" SERIAL PRIMARY KEY,
  "sender_id" integer,
  "receiver_id" integer,
  "property_id" integer,
  "content" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer,
  "title" varchar(255),
  "content" text,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "availability" (
  "id" SERIAL PRIMARY KEY,
  "property_id" integer NOT NULL,
  "available_date" date NOT NULL,
  "is_available" boolean DEFAULT true
);

CREATE TABLE "payments" (
  "id" SERIAL PRIMARY KEY,
  "booking_id" integer,
  "amount" decimal(10,2) NOT NULL,
  "payment_status" varchar(20),
  "payment_method" varchar(50),
  "transaction_id" text,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

COMMENT ON COLUMN "users"."role" IS 'guest | host | admin';

COMMENT ON COLUMN "properties"."property_type" IS 'apartment | house | villa | studio';

COMMENT ON COLUMN "properties"."status" IS 'active | inactive | pending';

COMMENT ON COLUMN "bookings"."booking_status" IS 'pending | confirmed | cancelled | completed';

COMMENT ON COLUMN "reviews"."rating" IS 'CHECK rating >= 1 AND rating <= 5';

COMMENT ON COLUMN "amenities"."name" IS 'wifi | pool | parking | kitchen...';

COMMENT ON COLUMN "payments"."payment_status" IS 'pending | completed | failed | refunded';

COMMENT ON COLUMN "payments"."payment_method" IS 'card | paypal | stripe | bank_transfer';

ALTER TABLE "properties" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "property_images" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookings" ADD FOREIGN KEY ("guest_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookings" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("reviewer_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "property_amenities" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "property_amenities" ADD FOREIGN KEY ("amenity_id") REFERENCES "amenities" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "wishlists" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "wishlists" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("receiver_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "availability" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") DEFERRABLE INITIALLY IMMEDIATE;
