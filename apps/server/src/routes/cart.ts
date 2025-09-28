/**
 * Cart routes for MG Mart grocery application
 *
 * Handles shopping cart operations
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router } from "express";
import { CartController } from "../controllers/index.js";
import { authenticateToken } from "../middleware/auth.js";

const router: Router = Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticateToken);

// Cart routes
router.get("/", cartController.getCart);
router.post("/add", cartController.addItem);
router.put("/update/:productId", cartController.updateItem);
router.delete("/remove/:productId", cartController.removeItem);
router.delete("/clear", cartController.clearCart);

export default router;
