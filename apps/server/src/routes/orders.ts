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
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router: Router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticateToken);

// Order routes
router.post("/", orderController.createOrder);
router.get("/history", orderController.getOrderHistory);
router.get("/:orderId", orderController.getOrderById);
router.put("/:orderId/cancel", orderController.cancelOrder);

// Admin-only routes
router.get("/", requireAdmin, orderController.getAllOrders);
router.get("/stats", requireAdmin, orderController.getOrderStats);
router.put("/:orderId/status", requireAdmin, orderController.updateOrderStatus);

export default router;

