/**
 * Authentication routes for MG Mart grocery application
 *
 * Handles user registration and login endpoints
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router } from "express";
import { UserController } from "../controllers/index.js";

const router: Router = Router();
const userController = new UserController();

// Authentication routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/refresh", userController.refreshToken);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

export default router;
