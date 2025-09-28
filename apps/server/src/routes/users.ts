/**
 * User management routes for MG Mart grocery application
 *
 * Handles user profile operations
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router } from "express";
import { UserController } from "../controllers/index.js";
import { authenticateToken } from "../middleware/auth.js";

const router: Router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// User profile routes
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.put("/change-password", userController.changePassword);
router.delete("/account", userController.deleteAccount);

export default router;
