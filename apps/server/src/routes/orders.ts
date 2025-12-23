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

// User order routes
router.post("/", orderController.createOrder);
router.get("/", orderController.getOrderHistory); // Fixed: Use getOrderHistory for user's orders
router.get("/:orderId", orderController.getOrderById);

// Admin-only routes
router.get("/admin/all", requireAdmin, orderController.getAllOrders); // Admin: Get all orders
router.get("/admin/stats", requireAdmin, orderController.getOrderStats); // Admin: Get order statistics
router.put("/:orderId/status", requireAdmin, orderController.updateOrderStatus); // Admin: Update order status

export default router;

export default router;

