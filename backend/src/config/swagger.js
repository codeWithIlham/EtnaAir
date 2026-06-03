// ============================================================
// ETNAir — Configuration Swagger complète
// Accessible : http://localhost:3000/api-docs
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🏠 ETNAir API",
      version: "1.0.0",
      description: "API REST de la plateforme de location ETNAir — inspirée d'Airbnb.",
      contact: {
        name: "Équipe ETNAir",
        email: "admin@etnair.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur local développement",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez votre token JWT : Bearer <token>",
        },
      },
      schemas: {

        // USER
        UserRegister: {
          type: "object",
          required: ["first_name", "last_name", "email", "password"],
          properties: {
            first_name:   { type: "string", example: "Oliver" },
            last_name:    { type: "string", example: "Davis" },
            email:        { type: "string", format: "email", example: "oliver.davis@email.com" },
            password:     { type: "string", format: "password", example: "MonMotDePasse123!" },
            phone_number: { type: "string", example: "+33600000006" },
            bio:          { type: "string", example: "Frequent traveler, love discovering new cities." },
          },
        },

        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", format: "email", example: "oliver.davis@email.com" },
            password: { type: "string", format: "password", example: "MonMotDePasse123!" },
          },
        },

        UserResponse: {
          type: "object",
          properties: {
            id:           { type: "integer", example: 6 },
            first_name:   { type: "string", example: "Oliver" },
            last_name:    { type: "string", example: "Davis" },
            email:        { type: "string", example: "oliver.davis@email.com" },
            phone_number: { type: "string", example: "+33600000006" },
            bio:          { type: "string", example: "Frequent traveler, love discovering new cities." },
            role:         { type: "string", enum: ["guest", "host", "admin"], example: "guest" },
            is_verified:  { type: "boolean", example: true },
            created_at:   { type: "string", format: "date-time" },
          },
        },

        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user:  { $ref: "#/components/schemas/UserResponse" },
          },
        },

        // PROPERTY
        PropertyCreate: {
          type: "object",
          required: ["title", "description", "price_per_night", "max_guests"],
          properties: {
            title:           { type: "string", example: "Charming Studio in Montmartre" },
            description:     { type: "string", example: "A cozy studio in the heart of Montmartre." },
            price_per_night: { type: "number", format: "float", example: 85.00 },
            property_type:   { type: "string", enum: ["studio", "apartment", "house", "villa"], example: "studio" },
            max_guests:      { type: "integer", example: 2 },
            bedrooms:        { type: "integer", example: 1 },
            bathrooms:       { type: "integer", example: 1 },
            country:         { type: "string", example: "France" },
            city:            { type: "string", example: "Paris" },
            address:         { type: "string", example: "12 Rue Lepic, 75018 Paris" },
            latitude:        { type: "number", example: 48.886490 },
            longitude:       { type: "number", example: 2.337320 },
          },
        },

        PropertyResponse: {
          type: "object",
          properties: {
            id:              { type: "integer", example: 1 },
            owner_id:        { type: "integer", example: 2 },
            title:           { type: "string", example: "Charming Studio in Montmartre" },
            description:     { type: "string", example: "A cozy studio in the heart of Montmartre." },
            price_per_night: { type: "number", example: 85.00 },
            property_type:   { type: "string", example: "studio" },
            max_guests:      { type: "integer", example: 2 },
            bedrooms:        { type: "integer", example: 1 },
            bathrooms:       { type: "integer", example: 1 },
            country:         { type: "string", example: "France" },
            city:            { type: "string", example: "Paris" },
            address:         { type: "string", example: "12 Rue Lepic, 75018 Paris" },
            latitude:        { type: "number", example: 48.886490 },
            longitude:       { type: "number", example: 2.337320 },
            status:          { type: "string", enum: ["active", "inactive"], example: "active" },
            created_at:      { type: "string", format: "date-time" },
          },
        },

        // BOOKING
        BookingCreate: {
          type: "object",
          required: ["property_id", "start_date", "end_date"],
          properties: {
            property_id: { type: "integer", example: 1 },
            start_date:  { type: "string", format: "date", example: "2025-06-01" },
            end_date:    { type: "string", format: "date", example: "2025-06-05" },
          },
        },

        BookingResponse: {
          type: "object",
          properties: {
            id:             { type: "integer", example: 1 },
            guest_id:       { type: "integer", example: 6 },
            property_id:    { type: "integer", example: 1 },
            start_date:     { type: "string", format: "date", example: "2025-06-01" },
            end_date:       { type: "string", format: "date", example: "2025-06-05" },
            total_price:    { type: "number", example: 340.00 },
            booking_status: { type: "string", enum: ["pending", "confirmed", "completed", "cancelled"], example: "pending" },
            created_at:     { type: "string", format: "date-time" },
          },
        },

        // REVIEW
        ReviewCreate: {
          type: "object",
          required: ["property_id", "booking_id", "rating"],
          properties: {
            property_id: { type: "integer", example: 1 },
            booking_id:  { type: "integer", example: 1 },
            rating:      { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment:     { type: "string", example: "Amazing studio! Perfect location in Montmartre." },
          },
        },

        ReviewResponse: {
          type: "object",
          properties: {
            id:          { type: "integer", example: 1 },
            reviewer_id: { type: "integer", example: 6 },
            property_id: { type: "integer", example: 1 },
            booking_id:  { type: "integer", example: 1 },
            rating:      { type: "integer", example: 5 },
            comment:     { type: "string", example: "Amazing studio! Perfect location in Montmartre." },
            created_at:  { type: "string", format: "date-time" },
          },
        },

        // ERROR
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Unauthorized" },
            status:  { type: "integer", example: 401 },
          },
        },
      },
    },

    // PATHS
    paths: {

      // AUTH
      "/auth/register": {
        post: {
          tags: ["🔐 Auth"],
          summary: "Créer un compte utilisateur",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserRegister" } },
            },
          },
          responses: {
            201: { description: "Compte créé", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            400: { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Email déjà utilisé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/auth/login": {
        post: {
          tags: ["🔐 Auth"],
          summary: "Se connecter et obtenir un token JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserLogin" } },
            },
          },
          responses: {
            200: { description: "Connexion réussie", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            401: { description: "Identifiants incorrects", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // USERS
      "/users": {
        get: {
          tags: ["👤 Utilisateurs"],
          summary: "Lister tous les utilisateurs",
          responses: {
            200: { description: "Liste des utilisateurs", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/UserResponse" } } } } },
          },
        },
      },

      "/users/{id}": {
        get: {
          tags: ["👤 Utilisateurs"],
          summary: "Détail d'un utilisateur",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 6 }],
          responses: {
            200: { description: "Utilisateur trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
            404: { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // PROPERTIES
      "/annonces": {
        get: {
          tags: ["🏠 Annonces"],
          summary: "Lister toutes les annonces",
          parameters: [
            { name: "city", in: "query", schema: { type: "string" }, example: "Paris" },
            { name: "max_price", in: "query", schema: { type: "number" }, example: 100 },
          ],
          responses: {
            200: { description: "Liste des annonces", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PropertyResponse" } } } } },
          },
        },
        post: {
          tags: ["🏠 Annonces"],
          summary: "Créer une annonce (host uniquement)",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyCreate" } } } },
          responses: {
            201: { description: "Annonce créée", content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyResponse" } } } },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Accès refusé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/annonces/{id}": {
        get: {
          tags: ["🏠 Annonces"],
          summary: "Détail d'une annonce",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
          responses: {
            200: { description: "Annonce trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyResponse" } } } },
            404: { description: "Non trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        put: {
          tags: ["🏠 Annonces"],
          summary: "Modifier une annonce",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyCreate" } } } },
          responses: {
            200: { description: "Mise à jour", content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyResponse" } } } },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Non trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["🏠 Annonces"],
          summary: "Supprimer une annonce",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
          responses: {
            200: { description: "Supprimée" },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Non trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // BOOKINGS
      "/bookings": {
        get: {
          tags: ["📅 Réservations"],
          summary: "Mes réservations",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Liste", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/BookingResponse" } } } } },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["📅 Réservations"],
          summary: "Créer une réservation",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BookingCreate" } } } },
          responses: {
            201: { description: "Réservation créée", content: { "application/json": { schema: { $ref: "#/components/schemas/BookingResponse" } } } },
            400: { description: "Dates invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/bookings/{id}": {
        get: {
          tags: ["📅 Réservations"],
          summary: "Détail d'une réservation",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
          responses: {
            200: { description: "Réservation trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/BookingResponse" } } } },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Non trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["📅 Réservations"],
          summary: "Annuler une réservation",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
          responses: {
            200: { description: "Annulée" },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Non trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // REVIEWS
      "/reviews/property/{id}": {
        get: {
          tags: ["⭐ Avis"],
          summary: "Avis d'un logement",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 3 }],
          responses: {
            200: { description: "Liste des avis", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ReviewResponse" } } } } },
            404: { description: "Logement non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/reviews": {
        post: {
          tags: ["⭐ Avis"],
          summary: "Laisser un avis",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewCreate" } } } },
          responses: {
            201: { description: "Avis publié", content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewResponse" } } } },
            400: { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Non authentifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
