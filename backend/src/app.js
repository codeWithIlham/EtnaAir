require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const client = require("prom-client");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Durée des requêtes HTTP en secondes",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Nombre total de requêtes HTTP",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const propertyRoutes = require("./routes/property.routes");
const bookingRoutes = require("./routes/booking.routes");
const reviewRoutes = require("./routes/review.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const messageRoutes = require("./routes/message.routes");
const notificationRoutes = require("./routes/notification.routes");
const paymentRoutes  = require("./routes/payment.routes");
const uploadRoutes   = require("./routes/upload.routes");
const serviceRoutes  = require("./routes/service.routes");

const app = express();

app.set('etag', false);
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(cors());
app.use(express.json());
// Logging HTTP (morgan)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Middleware de métriques HTTP
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    end({ method: req.method, route, status_code: res.statusCode });
    httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

// Endpoint Prometheus
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Sérialisation des Decimal Prisma en nombres
app.set("json replacer", (key, value) => {
  if (
    value !== null &&
    typeof value === "object" &&
    value.constructor &&
    value.constructor.name === "Decimal"
  ) {
    return parseFloat(value.toString());
  }
  return value;
});

// Documentation Swagger → http://localhost:3000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes API
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// /properties et /annonces → même contrôleur
app.use("/properties", propertyRoutes);
app.use("/annonces", propertyRoutes);

app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/messages", messageRoutes);
app.use("/notifications", notificationRoutes);
app.use("/payments", paymentRoutes);
app.use("/upload",   uploadRoutes);
app.use("/services", serviceRoutes);

module.exports = app;
