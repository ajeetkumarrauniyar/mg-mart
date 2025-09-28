/**
 * Product routes for MG Mart grocery application
 *
 * Handles product CRUD operations
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router } from "express";
import { ProductController } from "../controllers/index.js";
import { authenticateToken } from "../middleware/auth.js";

const router: Router = Router();
const productController = new ProductController();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes (admin only - you may want to add admin middleware)
router.post("/", authenticateToken, productController.createProduct);
router.put("/:id", authenticateToken, productController.updateProduct);
router.delete("/:id", authenticateToken, productController.deleteProduct);

export default router;
