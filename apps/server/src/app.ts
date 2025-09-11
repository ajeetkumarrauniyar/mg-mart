import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { admin, db } from "./config/database.js";

dotenv.config();

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

// Routes
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

app.get("/api/info", (req: Request, res: Response) => {
  res.json({
    name: "MG Mart API",
    version: "1.0.0",
    description: "Express server for MG Mart application",
    endpoints: [
      { path: "/", method: "GET", description: "Welcome message" },
      { path: "/health", method: "GET", description: "Health check" },
      { path: "/api/info", method: "GET", description: "API information" },
    ],
  });
});

app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    const userJson = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
    });

    const user = await db.collection("users").doc(userJson.uid).set(userJson);
    res.status(200).json({
      message: "User registered successfully",
      user: user,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.sendStatus(500);
  }
});

export default app;
