import express from "express";
import { initializeFirebase } from "../services/firebase.js";
import { UserRepository, ProductRepository } from "../repositories/index.js";

const app = express();
app.use(express.json());

initializeFirebase();

const userRepo = new UserRepository();
const productRepo = new ProductRepository();

// Test user creation
app.post("/test/users", async (req, res) => {
  try {
    const user = await userRepo.create(req.body);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test product creation
app.post("/test/products", async (req, res) => {
  try {
    const product = await productRepo.create(req.body);
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Test server running on port 3001");
});
