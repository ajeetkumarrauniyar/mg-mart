import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initializeFirebase } from "./services/firebase.js";
import { errorHandler } from "./utils/errorHandler.js";
import apiRoutes from "./routes/index.js";

dotenv.config();

initializeFirebase();

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Basic Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello from Express with TypeScript!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || "8000",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api", apiRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
