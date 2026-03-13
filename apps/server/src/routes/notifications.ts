/**
 * Notification routes for MG Mart grocery application
 *
 * FCM token registration for push notifications.
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router, Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notificationService.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequired } from "../utils/validation.js";
import { ApiError } from "../utils/errorHandler.js";

const router: Router = Router();

// All notification routes require authentication
router.use(authenticateToken);

/**
 * Register FCM token for push notifications
 */
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }

    const { token, deviceId, platform } = req.body;

    validateRequired(token, "token");
    validateRequired(deviceId, "deviceId");
    validateRequired(platform, "platform");

    const validPlatforms = ["ios", "android", "web"];
    if (!validPlatforms.includes(platform)) {
      throw new ApiError("Invalid platform. Must be ios, android, or web", 400);
    }

    await notificationService.registerToken(userId, token, deviceId, platform);

    res.json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Remove FCM token
 */
router.delete("/token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }

    const { deviceId } = req.body;

    validateRequired(deviceId, "deviceId");

    await notificationService.removeToken(userId, deviceId);

    res.json({
      success: true,
      message: "FCM token removed successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
