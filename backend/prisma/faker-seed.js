// ============================================================
// ETNAir — Faker.js Seed (données fictives volumineuses)
// Utilisation : node prisma/faker-seed.js [--count=50]
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker/locale/fr");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const countArg = args.find(a => a.startsWith("--count="));
const COUNT = countArg ? parseInt(countArg.split("=")[1]) : 20;

const CITIES = ["Paris", "Lyon", "Bordeaux", "Nice", "Marseille", "Toulouse", "Nantes", "Strasbourg"];
const TYPES = ["studio", "apartment", "house", "villa"];
const ROLES = ["guest", "guest", "guest", "host"]; // 75% guests, 25% hosts
const CITY_IMAGES = {
  Paris:      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  Lyon:       "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&q=80",
  Bordeaux:   "https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80",
  Nice:       "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80",
  Marseille:  "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=800&q=80",
  Toulouse:   "https://images.unsplash.com/photo-1532951974108-bd9e6b37f962?w=800&q=80",
  Nantes:     "https://images.unsplash.com/photo-1571909997832-cbf27afb3f17?w=800&q=80",
  Strasbourg: "https://images.unsplash.com/photo-1605722243979-fe0be8158232?w=800&q=80",
};

async function main() {
  console.log(`🌱 Faker seed — création de ${COUNT} utilisateurs + logements...`);

  const hash = await bcrypt.hash("password", 10);

  // Créer des utilisateurs fictifs
  const users = [];
  for (let i = 0; i < COUNT; i++) {
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName  = faker.person.lastName();
    const email     = faker.internet.email({ firstName, lastName, provider: "etnair.fake" }).toLowerCase();
    const role      = ROLES[Math.floor(Math.random() * ROLES.length)];

    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          first_name:    firstName,
          last_name:     lastName,
          email,
          password_hash: hash,
          role,
          is_verified:   faker.datatype.boolean(0.8),
          phone_number:  faker.phone.number("06 ## ## ## ##"),
          bio:           faker.person.bio(),
        },
      });
      users.push(user);
    } catch { /* skip duplicate email */ }
  }
  console.log(`✅ ${users.length} utilisateurs créés`);

  // Créer des logements fictifs (hôtes seulement)
  const hosts = users.filter(u => u.role === "host");
  if (hosts.length === 0) {
    console.log("⚠️ Aucun hôte généré — augmentez --count");
    return;
  }

  const propCount = await prisma.property.count();
  let createdProps = 0;

  // Créer 2-4 logements par hôte
  for (const host of hosts) {
    const numProps = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < numProps; j++) {
      const city       = faker.helpers.arrayElement(CITIES);
      const propType   = faker.helpers.arrayElement(TYPES);
      const bedrooms   = faker.number.int({ min: 1, max: 5 });
      const bathrooms  = faker.number.int({ min: 1, max: 3 });
      const maxGuests  = bedrooms * 2;
      const price      = faker.number.float({ min: 40, max: 450, fractionDigits: 2 });

      const titleMap = {
        studio:    [`Studio ${faker.word.adjective()} ${city}`, `Beau studio au cœur de ${city}`],
        apartment: [`Appartement ${faker.word.adjective()} à ${city}`, `Superbe appartement ${city} centre`],
        house:     [`Maison ${faker.word.adjective()} près de ${city}`, `Belle maison à ${city}`],
        villa:     [`Villa ${faker.word.adjective()} ${city}`, `Magnifique villa à ${city}`],
      };

      const prop = await prisma.property.create({
        data: {
          owner_id:       host.id,
          title:          faker.helpers.arrayElement(titleMap[propType]),
          description:    faker.lorem.paragraphs(2),
          price_per_night: price,
          property_type:  propType,
          max_guests:     maxGuests,
          bedrooms,
          bathrooms,
          country:        "France",
          city,
          address:        `${faker.location.streetAddress()}, ${faker.location.zipCode()} ${city}`,
          status:         "active",
        },
      });

      // Image depuis la ville
      const imageUrl = CITY_IMAGES[city] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";
      await prisma.propertyImage.create({
        data: { property_id: prop.id, image_url: imageUrl, is_main: true },
      });
      createdProps++;
    }
  }
  console.log(`✅ ${createdProps} logements créés`);

  // Créer des réservations fictives
  const guests = users.filter(u => u.role === "guest");
  const allProps = await prisma.property.findMany({ where: { owner_id: { in: hosts.map(h => h.id) } } });
  let bookingsCreated = 0;

  for (const guest of guests.slice(0, 10)) {
    const numBookings = faker.number.int({ min: 1, max: 3 });
    for (let k = 0; k < numBookings; k++) {
      const prop = faker.helpers.arrayElement(allProps);
      const start = faker.date.future({ years: 1 });
      const end = new Date(start);
      end.setDate(end.getDate() + faker.number.int({ min: 1, max: 7 }));
      const nights = Math.ceil((end - start) / 86400000);
      const totalPrice = parseFloat(prop.price_per_night) * nights;
      const statuses = ["pending", "confirmed", "confirmed", "completed", "cancelled"];

      await prisma.booking.create({
        data: {
          guest_id:       guest.id,
          property_id:    prop.id,
          start_date:     start,
          end_date:       end,
          total_price:    totalPrice,
          booking_status: faker.helpers.arrayElement(statuses),
        },
      }).catch(() => {});
      bookingsCreated++;
    }
  }
  console.log(`✅ ${bookingsCreated} réservations créées`);

  // Créer des avis fictifs
  let reviewsCreated = 0;
  for (const guest of guests.slice(0, 8)) {
    const prop = faker.helpers.arrayElement(allProps);
    await prisma.review.create({
      data: {
        reviewer_id: guest.id,
        property_id: prop.id,
        rating:      faker.number.int({ min: 3, max: 5 }),
        comment:     faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
      },
    }).catch(() => {});
    reviewsCreated++;
  }
  console.log(`✅ ${reviewsCreated} avis créés`);

  console.log("\n🎉 Faker seed terminé !");
  console.log(`   Total : ${users.length} users · ${createdProps} logements · ${bookingsCreated} réservations`);
}

main()
  .catch(e => { console.error("❌ Faker seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
