/**
 * Admin routes for MG Mart grocery application
 *
 * Handles admin-specific operations like dashboard stats, order management, and user administration
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router } from "express";
import { AdminController } from "../controllers/index.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router: Router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard routes
router.get("/dashboard", adminController.getDashboardStats);

// Admin order management routes
router.get("/orders", adminController.getAllOrders);
router.get("/orders/stats", adminController.getOrderStats);
router.get("/orders/analytics", adminController.getOrderAnalytics);
router.get("/orders/export", adminController.exportOrders);
router.patch("/orders/bulk-status", adminController.bulkUpdateOrderStatus);

// Admin user management routes
router.post("/users", adminController.createUser);
router.delete("/users/:userId", adminController.deleteUser);
router.get("/users/stats", adminController.getUserStats);

export default router;