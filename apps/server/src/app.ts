import Fastify, { FastifyInstance } from "fastify";
import dotenv from "dotenv";

dotenv.config();

const app: FastifyInstance = Fastify({
  logger: true,
});

// Register CORS plugin
await app.register(import("@fastify/cors"), {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Routes
app.get("/", async (request, reply) => {
  return {
    message: "Hello from Fastify with TypeScript!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || "8000",
  };
});

app.get("/health", async (request, reply) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

app.get("/api/info", async (request, reply) => {
  return {
    name: "MG Mart API",
    version: "1.0.0",
    description: "Fastify server for MG Mart application",
    endpoints: [
      { path: "/", method: "GET", description: "Welcome message" },
      { path: "/health", method: "GET", description: "Health check" },
      { path: "/api/info", method: "GET", description: "API information" },
    ],
  };
});

export default app;
