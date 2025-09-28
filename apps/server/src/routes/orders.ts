/**
 * Order routes for MG Mart grocery application
 *
 * Handles order management operations
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router } from "express";
import { OrderController } from "../controllers/index.js";
import { authenticateToken } from "../middleware/auth.js";

const router: Router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticateToken);

// Order routes
router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/status", orderController.updateOrderStatus);

export default router;

