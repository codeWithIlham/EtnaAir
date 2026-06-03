// ============================================================
// ETNAir — Seed Database
// Stratégie : upsert users (par email), create properties/bookings/reviews
// seulement si la table est vide → idempotent, ne casse pas les tests
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ETNAir database...");

  // 1. USERS (upsert par email, toujours safe)
  const pass = await bcrypt.hash("password", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@etnair.com" },
    update: { first_name: "Etna", last_name: "Admin" },
    create: {
      first_name: "Etna", last_name: "Admin",
      email: "admin@etnair.com", password_hash: pass,
      role: "admin", is_verified: true,
      bio: "Administrateur de la plateforme ETNAir.",
    },
  });

  const james = await prisma.user.upsert({
    where: { email: "james.carter@email.com" },
    update: {},
    create: {
      first_name: "James", last_name: "Carter",
      email: "james.carter@email.com", password_hash: pass,
      role: "host", is_verified: true,
      phone_number: "+33 6 12 34 56 78",
      bio: "Hôte passionné, 5 ans d'expérience. J'adore partager mes logements avec des voyageurs.",
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah.wilson@email.com" },
    update: {},
    create: {
      first_name: "Sarah", last_name: "Wilson",
      email: "sarah.wilson@email.com", password_hash: pass,
      role: "host", is_verified: true,
      phone_number: "+33 6 98 76 54 32",
      bio: "Architecte de formation, logements au design unique dans les plus belles villes de France.",
    },
  });

  const oliver = await prisma.user.upsert({
    where: { email: "oliver.davis@email.com" },
    update: {},
    create: {
      first_name: "Oliver", last_name: "Davis",
      email: "oliver.davis@email.com", password_hash: pass,
      role: "guest", is_verified: true,
      bio: "Voyageur passionné, j'aime découvrir les cultures locales.",
    },
  });

  const emma = await prisma.user.upsert({
    where: { email: "emma.martin@email.com" },
    update: {},
    create: {
      first_name: "Emma", last_name: "Martin",
      email: "emma.martin@email.com", password_hash: pass,
      role: "guest", is_verified: true,
      bio: "Amatrice de bons restaurants et de belles vues.",
    },
  });

  console.log(`✅ Users : admin(${admin.id}) james(${james.id}) sarah(${sarah.id}) oliver(${oliver.id}) emma(${emma.id})`);

  // 2. PROPERTIES — créer seulement si DB vide
  const propCount = await prisma.property.count();
  let createdProps = [];

  if (propCount === 0) {
    const propertiesData = [
      // ── PARIS (8 logements) ──
      { owner_id: james.id, title: "Charming Studio in Montmartre", description: "Charmant studio au cœur de Montmartre, à deux pas du Sacré-Cœur et des galeries d'art. Ambiance bohème garantie.", price_per_night: 85, property_type: "studio", max_guests: 2, bedrooms: 1, bathrooms: 1, country: "France", city: "Paris", address: "12 Rue Lepic, 75018 Paris", status: "active", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85" },
      { owner_id: james.id, title: "Appartement vue Tour Eiffel", description: "Magnifique appartement haussmannien avec vue imprenable sur la Tour Eiffel. Parquet ancien, moulures, cuisine équipée.", price_per_night: 155, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 1, country: "France", city: "Paris", address: "8 Avenue de Suffren, 75007 Paris", status: "active", img: "https://images.unsplash.com/photo-1551882547-ff40c4fe1fa7?w=900&q=85" },
      { owner_id: sarah.id, title: "Loft industriel République", description: "Grand loft 90m² dans une manufacture rénovée. Plafond 4m, briques apparentes, verrière spectaculaire. Quartier vivant.", price_per_night: 135, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 1, country: "France", city: "Paris", address: "18 Rue du Faubourg du Temple, 75011 Paris", status: "active", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=85" },
      { owner_id: sarah.id, title: "Suite de luxe Saint-Germain", description: "Suite exceptionnelle dans l'emblématique Saint-Germain-des-Prés. Déco contemporaine, terrasse privée, service hôtelier.", price_per_night: 280, property_type: "apartment", max_guests: 2, bedrooms: 1, bathrooms: 1, country: "France", city: "Paris", address: "45 Rue de Rennes, 75006 Paris", status: "active", img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=85" },
      { owner_id: james.id, title: "Penthouse Champs-Élysées", description: "Penthouse exceptionnel avec terrasse panoramique face aux Champs-Élysées. Vue à 360° sur Paris, jacuzzi extérieur.", price_per_night: 450, property_type: "apartment", max_guests: 6, bedrooms: 3, bathrooms: 2, country: "France", city: "Paris", address: "74 Avenue des Champs-Élysées, 75008 Paris", status: "active", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85" },
      { owner_id: sarah.id, title: "Studio bohème Canal Saint-Martin", description: "Studio au charme indéniable avec vue sur le Canal Saint-Martin. Vélo fourni, café et brunch à deux pas.", price_per_night: 75, property_type: "studio", max_guests: 2, bedrooms: 1, bathrooms: 1, country: "France", city: "Paris", address: "23 Quai de Jemmapes, 75010 Paris", status: "active", img: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=900&q=85" },
      { owner_id: james.id, title: "Maison de village Montmartre", description: "Rare maison de village avec jardin privé au cœur de Montmartre. 3 niveaux, poutres apparentes, ambiance unique.", price_per_night: 320, property_type: "house", max_guests: 6, bedrooms: 3, bathrooms: 2, country: "France", city: "Paris", address: "3 Rue des Saules, 75018 Paris", status: "active", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85" },
      { owner_id: sarah.id, title: "Duplex moderne Marais", description: "Duplex contemporain 80m² au cœur du Marais historique. Design soigné, lumineux, proche des musées et restaurants branchés.", price_per_night: 195, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 2, country: "France", city: "Paris", address: "22 Rue de Bretagne, 75003 Paris", status: "active", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85" },

      // ── NICE & CÔTE D'AZUR (5 logements) ──
      { owner_id: sarah.id, title: "Villa de prestige avec piscine", description: "Somptueuse villa 280m² piscine à débordement, jardin méditerranéen, vue mer. 4 suites luxueuses, cuisine de chef.", price_per_night: 320, property_type: "villa", max_guests: 8, bedrooms: 4, bathrooms: 3, country: "France", city: "Nice", address: "24 Chemin des Collines, 06000 Nice", status: "active", img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=85" },
      { owner_id: james.id, title: "Appartement terrasse Promenade des Anglais", description: "Lumineux appartement avec terrasse face à la mer. Vue Méditerranée, climatisation, à 2 min de la plage.", price_per_night: 180, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 1, country: "France", city: "Nice", address: "47 Promenade des Anglais, 06000 Nice", status: "active", img: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=900&q=85" },
      { owner_id: sarah.id, title: "Villa piscine Cap d'Antibes", description: "Villa d'exception avec piscine privée et vue sur la baie d'Antibes. Terrain 1200m², palmiers, barbecue, pétanque.", price_per_night: 490, property_type: "villa", max_guests: 10, bedrooms: 5, bathrooms: 4, country: "France", city: "Nice", address: "Cap d'Antibes, 06160 Antibes", status: "active", img: "https://images.unsplash.com/photo-1577003811926-53b288a6e5d0?w=900&q=85" },
      { owner_id: james.id, title: "Studio vue mer Vieux-Nice", description: "Charmant studio avec vue sur la Méditerranée dans le Vieux-Nice coloré. Marché provençal à 5 min.", price_per_night: 95, property_type: "studio", max_guests: 2, bedrooms: 1, bathrooms: 1, country: "France", city: "Nice", address: "8 Cours Saleya, 06300 Nice", status: "active", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85" },
      { owner_id: sarah.id, title: "Penthouse Monaco avec jacuzzi", description: "Penthouse spectaculaire avec terrasse jacuzzi et vue sur Monaco. Prestations palace, parking privé inclus.", price_per_night: 650, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 2, country: "France", city: "Nice", address: "Boulevard de la Croisette, 06400 Cannes", status: "active", img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900&q=85" },

      // ── LYON (4 logements) ──
      { owner_id: sarah.id, title: "Luxury Villa with Pool in Lyon", description: "Villa 280m² piscine à débordement, jardin méditerranéen. 4 suites, cuisine chef, terrasse panoramique.", price_per_night: 320, property_type: "villa", max_guests: 8, bedrooms: 4, bathrooms: 3, country: "France", city: "Lyon", address: "24 Chemin des Collines, 69004 Lyon", status: "active", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85" },
      { owner_id: james.id, title: "Appartement Presqu'île vue Saône", description: "Magnifique appartement sur la Presqu'île avec vue sur la Saône. Entièrement rénové, parquet, rooftop partagé.", price_per_night: 130, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 1, country: "France", city: "Lyon", address: "12 Quai Saint-Antoine, 69002 Lyon", status: "active", img: "https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=900&q=85" },
      { owner_id: sarah.id, title: "Traboule secrète Vieux-Lyon", description: "Appartement unique dans une traboule renaissance du Vieux-Lyon classé UNESCO. Authenticité absolue.", price_per_night: 110, property_type: "apartment", max_guests: 3, bedrooms: 1, bathrooms: 1, country: "France", city: "Lyon", address: "4 Rue du Bœuf, 69005 Lyon", status: "active", img: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=900&q=85" },
      { owner_id: james.id, title: "Maison avec jardin Croix-Rousse", description: "Maison de village avec jardin arboré sur les pentes de la Croix-Rousse. Vue panoramique sur Lyon, très calme.", price_per_night: 145, property_type: "house", max_guests: 5, bedrooms: 3, bathrooms: 2, country: "France", city: "Lyon", address: "8 Montée des Carmélites, 69001 Lyon", status: "active", img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=900&q=85" },

      // ── BORDEAUX (4 logements) ──
      { owner_id: sarah.id, title: "Studio design cœur de Bordeaux", description: "Studio épuré quartier Saint-Pierre classé UNESCO. 5 min de la Place de la Bourse et de la Garonne.", price_per_night: 70, property_type: "studio", max_guests: 2, bedrooms: 1, bathrooms: 1, country: "France", city: "Bordeaux", address: "3 Rue du Parlement Sainte-Catherine, 33000 Bordeaux", status: "active", img: "https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=900&q=85" },
      { owner_id: james.id, title: "Château bordelais avec vignoble", description: "Séjour unique dans un château du XIXe siècle entouré de ses vignes. Dégustation de Saint-Émilion incluse.", price_per_night: 380, property_type: "villa", max_guests: 8, bedrooms: 4, bathrooms: 3, country: "France", city: "Bordeaux", address: "Route des Châteaux, 33330 Saint-Émilion", status: "active", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=85" },
      { owner_id: sarah.id, title: "Loft contemporain Chartrons", description: "Loft 75m² dans l'ancien quartier des négociants en vin. Design épuré, galeries d'art et marché à pied.", price_per_night: 105, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 1, country: "France", city: "Bordeaux", address: "15 Rue Notre-Dame, 33300 Bordeaux", status: "active", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=85" },
      { owner_id: james.id, title: "Maison de maître avec jardin", description: "Élégante maison de maître bordelaise avec jardin privatif. Piscine chauffée, cave à vin, 3 chambres.", price_per_night: 250, property_type: "house", max_guests: 6, bedrooms: 3, bathrooms: 2, country: "France", city: "Bordeaux", address: "24 Rue Judaïque, 33000 Bordeaux", status: "active", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85" },

      // ── MARSEILLE (3 logements) ──
      { owner_id: james.id, title: "Bastide provençale avec vignes", description: "Bastide XVIIIe siècle entourée de vignes et oliviers. Pool-house, four à bois, 20 min du Vieux-Port.", price_per_night: 200, property_type: "house", max_guests: 6, bedrooms: 3, bathrooms: 2, country: "France", city: "Marseille", address: "Chemin des Bastidons, 13009 Marseille", status: "active", img: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=900&q=85" },
      { owner_id: sarah.id, title: "Appartement vue Vieux-Port", description: "Superbe appartement avec terrasse et vue directe sur le Vieux-Port de Marseille. Coucher de soleil magique.", price_per_night: 140, property_type: "apartment", max_guests: 4, bedrooms: 2, bathrooms: 1, country: "France", city: "Marseille", address: "3 Quai du Port, 13002 Marseille", status: "active", img: "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=900&q=85" },
      { owner_id: james.id, title: "Villa calanques piscine privée", description: "Villa spectaculaire en bordure des Calanques. Accès direct mer, piscine à débordement, vue imprenable.", price_per_night: 420, property_type: "villa", max_guests: 8, bedrooms: 4, bathrooms: 3, country: "France", city: "Marseille", address: "Route des Calanques, 13009 Marseille", status: "active", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=85" },

      // ── AUTRES VILLES ──
      { owner_id: sarah.id, title: "Chalet ski Chamonix", description: "Chalet authentique aux pieds des pistes avec vue sur le Mont-Blanc. Sauna, cheminée, équipements ski.", price_per_night: 290, property_type: "house", max_guests: 8, bedrooms: 4, bathrooms: 2, country: "France", city: "Chamonix", address: "Route du Mont-Blanc, 74400 Chamonix", status: "active", img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=85" },
      { owner_id: james.id, title: "Villa Strasbourg Alsace", description: "Belle maison alsacienne à colombages dans le centre historique de Strasbourg, près de la Petite France.", price_per_night: 165, property_type: "house", max_guests: 6, bedrooms: 3, bathrooms: 2, country: "France", city: "Strasbourg", address: "5 Rue des Dentelles, 67000 Strasbourg", status: "active", img: "https://images.unsplash.com/photo-1576485375217-d6a95e34d043?w=900&q=85" },
      { owner_id: sarah.id, title: "Appartement Toulouse Rose", description: "Bel appartement dans la Ville Rose, à deux pas du Capitole et de ses restaurants étoilés.", price_per_night: 85, property_type: "apartment", max_guests: 3, bedrooms: 1, bathrooms: 1, country: "France", city: "Toulouse", address: "8 Place du Capitole, 31000 Toulouse", status: "active", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=85" },
      { owner_id: james.id, title: "Manoir Normandie avec verger", description: "Manoir normand XVe siècle avec verger de pommiers, jardin à la française et étang privatif.", price_per_night: 310, property_type: "house", max_guests: 10, bedrooms: 5, bathrooms: 3, country: "France", city: "Honfleur", address: "Lieu-dit Le Moulin, 14600 Honfleur", status: "active", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=85" },
      { owner_id: sarah.id, title: "Villa Biarritz surf & ocean", description: "Villa moderne face à l'océan Atlantique à Biarritz. Terrasse panoramique, surf school à 100m, spa.", price_per_night: 260, property_type: "villa", max_guests: 6, bedrooms: 3, bathrooms: 2, country: "France", city: "Biarritz", address: "14 Avenue de l'Impératrice, 64200 Biarritz", status: "active", img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=900&q=85" },
    ];

    for (const { img, ...data } of propertiesData) {
      const prop = await prisma.property.create({ data });
      await prisma.propertyImage.create({
        data: { property_id: prop.id, image_url: img, is_main: true },
      });
      createdProps.push(prop);
    }
    console.log(`✅ ${createdProps.length} propriétés créées avec images Unsplash`);

    // 3. RÉINITIALISER LA SÉQUENCE PostgreSQL
    // Nécessaire pour éviter les conflits d'ID après inserts manuels
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('properties', 'id'), (SELECT MAX(id) FROM properties))`;

  } else {
    // Propriétés existantes : ajouter des images manquantes seulement
    console.log(`⏩ ${propCount} propriétés déjà en base — vérification des images...`);
    const FALLBACK_IMAGES = {
      Paris:     "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
      Lyon:      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&q=80",
      Bordeaux:  "https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80",
      Nice:      "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80",
      Marseille: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=800&q=80",
    };
    const PROP_IMAGES = {
      1: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      2: "https://images.unsplash.com/photo-1551882547-ff40c4fe1fa7?w=800&q=80",
      3: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      4: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      5: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      6: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
      7: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      8: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    };
    const allProps = await prisma.property.findMany({ include: { images: true } });
    let addedImages = 0;
    for (const p of allProps) {
      if (p.images.length === 0) {
        const url = PROP_IMAGES[p.id] || FALLBACK_IMAGES[p.city] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";
        await prisma.propertyImage.create({ data: { property_id: p.id, image_url: url, is_main: true } });
        addedImages++;
      }
    }
    if (addedImages > 0) console.log(`🖼  ${addedImages} images ajoutées aux propriétés existantes`);
    createdProps = allProps;
  }

  // 4. BOOKINGS — créer seulement si table vide
  const bookingCount = await prisma.booking.count();
  if (bookingCount === 0 && createdProps.length > 0) {
    const p = createdProps;
    const d = (n) => { const dt = new Date(); dt.setDate(dt.getDate() + n); return dt; };

    const bookingsData = [
      { guest_id: oliver.id, property_id: p[0].id, start_date: d(5),   end_date: d(8),   total_price: parseFloat(p[0].price_per_night) * 3, booking_status: "confirmed" },
      { guest_id: emma.id,   property_id: p[2].id, start_date: d(10),  end_date: d(14),  total_price: parseFloat(p[2].price_per_night) * 4, booking_status: "pending"   },
      { guest_id: oliver.id, property_id: p[4].id, start_date: d(-10), end_date: d(-7),  total_price: parseFloat(p[4].price_per_night) * 3, booking_status: "completed" },
      { guest_id: emma.id,   property_id: p[6].id, start_date: d(20),  end_date: d(23),  total_price: parseFloat(p[6].price_per_night) * 3, booking_status: "confirmed" },
      { guest_id: oliver.id, property_id: p[5].id, start_date: d(2),   end_date: d(5),   total_price: parseFloat(p[5].price_per_night) * 3, booking_status: "cancelled" },
    ];
    for (const b of bookingsData) await prisma.booking.create({ data: b });
    console.log(`✅ ${bookingsData.length} réservations créées`);
  } else if (bookingCount > 0) {
    console.log(`⏩ Réservations déjà existantes (${bookingCount}), skip`);
  }

  // 5. REVIEWS — créer seulement si table vide
  const reviewCount = await prisma.review.count();
  if (reviewCount === 0 && createdProps.length > 0) {
    const p = createdProps;
    const reviewsData = [
      { reviewer_id: oliver.id, property_id: p[0].id, rating: 5, comment: "Logement parfait, exactement comme sur les photos. Hôte exceptionnel, très réactif. Le quartier est fantastique !" },
      { reviewer_id: emma.id,   property_id: p[4].id, rating: 4, comment: "Studio très bien situé, propre et fonctionnel. Bordeaux est une ville magnifique !" },
      { reviewer_id: oliver.id, property_id: p[6].id, rating: 5, comment: "Le loft est incroyable ! Hauteur sous plafond impressionnante. Coup de cœur absolu." },
      { reviewer_id: emma.id,   property_id: p[1].id, rating: 5, comment: "Vue sur la Tour Eiffel magique le soir. Appartement superbe, tout le confort moderne." },
      { reviewer_id: oliver.id, property_id: p[3].id, rating: 4, comment: "Maison chaleureuse avec terrasse. Lyon est la capitale de la gastronomie !" },
      { reviewer_id: emma.id,   property_id: p[7].id, rating: 5, comment: "La bastide provençale est un vrai coup de cœur. Le four à bois, les vignes... Incroyable !" },
    ];
    for (const r of reviewsData) await prisma.review.create({ data: r });
    console.log(`✅ ${reviewsData.length} avis créés`);
  } else if (reviewCount > 0) {
    console.log(`⏩ Avis déjà existants (${reviewCount}), skip`);
  }

  // 6. AMENITIES
  const amenities = ["WiFi", "Climatisation", "Parking", "Piscine", "Cuisine équipée", "Machine à laver", "Balcon", "Vue mer", "Jacuzzi", "Barbecue"];
  for (const name of amenities) {
    await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`✅ ${amenities.length} équipements vérifiés`);

  // 7. SERVICES & ACTIVITÉS
  const serviceCount = await prisma.service.count().catch(() => 0);
  if (serviceCount === 0) {
    const servicesData = [
      // ── Bien-être ──
      { title: "Massage relaxant 1h", description: "Massage suédois complet par un thérapeute certifié. Huiles essentielles bio incluses.", category: "wellness", price: 85, duration: "1h", max_persons: 1, location: "Sur place ou à domicile", provider: "Wellness ETNAir", rating: 4.9, image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80" },
      { title: "Séance de yoga au lever du soleil", description: "Cours de yoga Vinyasa en plein air face à la mer ou en jardin. Tous niveaux bienvenus.", category: "wellness", price: 35, duration: "1h30", max_persons: 8, location: "Extérieur", provider: "Yoga Flow", rating: 4.8, image_url: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80" },
      { title: "Spa privatif 2h", description: "Accès privatif jacuzzi, hammam et sauna. Champagne et fruits frais inclus.", category: "wellness", price: 120, duration: "2h", max_persons: 4, location: "Centre spa partenaire", provider: "Spa Prestige", rating: 4.7, image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80" },

      // ── Gastronomie ──
      { title: "Chef privé à domicile", description: "Un chef étoilé cuisine un repas gastronomique 5 services dans votre logement. Menu personnalisé selon vos envies.", category: "gastronomy", price: 180, duration: "3h", max_persons: 8, location: "Votre logement", provider: "Chefs ETNAir", rating: 5.0, image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" },
      { title: "Cours de cuisine locale", description: "Apprenez à cuisiner des recettes régionales avec un chef local. Marché et cours inclus.", category: "gastronomy", price: 65, duration: "3h", max_persons: 6, location: "Cuisine équipée partenaire", provider: "Cook & Taste", rating: 4.9, image_url: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=600&q=80" },
      { title: "Dégustation de vins & fromages", description: "Initiation à la dégustation avec un sommelier. Sélection de 6 vins locaux et plateau fromages premium.", category: "gastronomy", price: 55, duration: "2h", max_persons: 10, location: "Cave partenaire ou domicile", provider: "Wine & Cheese Club", rating: 4.8, image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80" },
      { title: "Petit-déjeuner gourmet livré", description: "Panier petit-déjeuner artisanal livré à votre porte. Viennoiseries, fruits frais, jus et confitures maison.", category: "gastronomy", price: 28, duration: "Livraison 8h-10h", max_persons: 4, location: "Livraison logement", provider: "Morning Gourmet", rating: 4.7, image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80" },

      // ── Aventure ──
      { title: "Cours de surf initiation", description: "Apprenez à surfer avec un moniteur diplômé. Combinaison et planche fournies.", category: "adventure", price: 55, duration: "2h", max_persons: 6, location: "Plage locale", provider: "Surf School Pro", rating: 4.8, image_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80" },
      { title: "Randonnée guidée en montagne", description: "Trek demi-journée avec guide naturaliste. Découverte de la faune et flore locales. Pique-nique inclus.", category: "adventure", price: 45, duration: "4h", max_persons: 12, location: "Départ logement ou point de rendez-vous", provider: "Mountain Guides", rating: 4.9, image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80" },
      { title: "Saut en parachute tandem", description: "Saut en parachute tandem avec moniteur breveté d'État. Vidéo souvenir incluse. Sensation garantie !", category: "adventure", price: 250, duration: "3h (dont 45s de chute libre)", max_persons: 1, location: "Aérodrome local", provider: "SkyDive Experience", rating: 4.9, image_url: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=600&q=80" },

      // ── Culture ──
      { title: "Visite guidée de la ville", description: "Tour à pied du centre historique avec guide passionné. Anecdotes, histoire et secrets locaux.", category: "culture", price: 25, duration: "2h", max_persons: 15, location: "Centre-ville", provider: "City Tour France", rating: 4.8, image_url: "https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=600&q=80" },
      { title: "Visite musée privée", description: "Visite exclusive hors ouverture avec conservateur. Accès aux réserves et œuvres non exposées.", category: "culture", price: 95, duration: "2h", max_persons: 8, location: "Musée partenaire", provider: "Art & Culture", rating: 4.7, image_url: "https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=600&q=80" },
      { title: "Concert privé en soirée", description: "Soirée musicale intime avec musicien professionnel. Jazz, classique ou acoustique selon vos préférences.", category: "culture", price: 150, duration: "2h", max_persons: 20, location: "Votre logement ou venue partenaire", provider: "Live Music Events", rating: 4.9, image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80" },

      // ── Sport ──
      { title: "Cours de tennis privé", description: "Leçon individuelle avec moniteur fédéral. Court réservé, raquette et balles fournies.", category: "sport", price: 60, duration: "1h", max_persons: 2, location: "Court partenaire", provider: "Tennis Pro Club", rating: 4.6, image_url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80" },
      { title: "Session de golf initiation", description: "Découverte du golf sur parcours 9 trous avec moniteur. Club, chaussures et voiturette inclus.", category: "sport", price: 85, duration: "3h", max_persons: 3, location: "Golf local partenaire", provider: "Golf Experience", rating: 4.7, image_url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80" },
      { title: "Séance de fitness personnalisée", description: "Entraînement sur mesure avec coach certifié. Programme adapté à votre niveau et objectifs.", category: "sport", price: 50, duration: "1h", max_persons: 1, location: "Votre logement ou salle partenaire", provider: "FitLife Coaches", rating: 4.8, image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80" },

      // ── Divertissement ──
      { title: "Soirée jeux de société", description: "Animateur avec sélection de 50+ jeux. Idéal familles et groupes. Boissons et snacks inclus.", category: "entertainment", price: 40, duration: "3h", max_persons: 10, location: "Votre logement", provider: "Play & Fun", rating: 4.7, image_url: "https://images.unsplash.com/photo-1585504198199-20277593b94f?w=600&q=80" },
      { title: "Escape Game privatif", description: "Aventure immersive 1h dans une salle thématique. Idéal pour groupes, team building ou anniversaires.", category: "entertainment", price: 120, duration: "1h30", max_persons: 6, location: "Salle partenaire", provider: "Escape World", rating: 4.9, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
      { title: "Animation enfants", description: "Magicien, clown ou conteur pour vos enfants. Spectacle et atelier créatif 2h. Dès 4 ans.", category: "entertainment", price: 95, duration: "2h", max_persons: 15, location: "Votre logement", provider: "Kids Entertainment", rating: 4.8, image_url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80" },

      // ── Transport ──
      { title: "Transfert aéroport en berline", description: "Chauffeur privé pour vos transferts aéroport/gare. Véhicule premium, ponctualité garantie.", category: "transport", price: 65, duration: "Selon trajet", max_persons: 4, location: "À la demande", provider: "ETNAir Chauffeurs", rating: 4.9, image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80" },
      { title: "Location vélo électrique", description: "Vélo électrique premium pour une journée. Casque, antivol et carte des pistes cyclables inclus.", category: "transport", price: 30, duration: "Journée", max_persons: 4, location: "Livraison logement", provider: "E-Bike Rental", rating: 4.7, image_url: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80" },

      // ── Nature ──
      { title: "Observation des étoiles", description: "Nuit d'astronomie avec télescope professionnel et astronome amateur. Vin chaud et couvertures fournis.", category: "nature", price: 45, duration: "2h (nuit)", max_persons: 8, location: "Site d'observation à 30 min", provider: "Stars & Sky", rating: 5.0, image_url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80" },
      { title: "Pique-nique champêtre organisé", description: "Panier pique-nique gastronomique livré dans un cadre naturel d'exception. Nappe, vaisselle et décoration incluses.", category: "nature", price: 55, duration: "Demi-journée", max_persons: 6, location: "Lieu secret révélé à la réservation", provider: "Picnic & Nature", rating: 4.8, image_url: "https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=600&q=80" },
    ];
    for (const s of servicesData) {
      await prisma.service.create({ data: s });
    }
    console.log(`✅ ${servicesData.length} services & activités créés`);
  } else {
    console.log(`⏩ Services déjà en base (${serviceCount}), skip`);
  }

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  👑 admin@etnair.com        / password  (admin)");
  console.log("  🏠 james.carter@email.com  / password  (host)");
  console.log("  🏠 sarah.wilson@email.com  / password  (host)");
  console.log("  👤 oliver.davis@email.com  / password  (guest)");
  console.log("  👤 emma.martin@email.com   / password  (guest)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
