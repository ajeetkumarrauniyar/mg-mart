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

// Test environment variables endpoint
app.get("/test-env", (req: Request, res: Response) => {
  const envVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'Not set',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set',
    GOOGLE_CUSTOM_SEARCH_API_KEY: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY ? 'Set' : 'Not set',
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID ? 'Set' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'Not set'
  };

  res.json({
    success: true,
    message: 'Environment variables status',
    data: envVars
  });
});

// API Routes
app.use("/api", apiRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
