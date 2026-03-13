/**
 * Store routes for MG Mart grocery application
 *
 * Provides store status and delivery information.
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Router, Request, Response, NextFunction } from "express";
import { deliveryService } from "../services/deliveryService.js";
import { authenticateToken } from "../middleware/auth.js";

const router: Router = Router();

/**
 * Get store status and delivery info (public)
 */
router.get("/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await deliveryService.getStoreConfig();

    res.json({
      success: true,
      data: {
        isOpen: config.isActive && config.isAcceptingOrders,
        storeName: config.storeName,
        message: config.isAcceptingOrders
          ? "Store is open and accepting orders"
          : "Store is currently not accepting orders",
        operatingHours: config.delivery.operatingHours,
        deliveryRadiusKm: config.delivery.radiusKm,
        minOrderAmount: config.delivery.minOrderAmount,
        deliveryFee: config.delivery.deliveryFee,
        freeDeliveryAbove: config.delivery.freeDeliveryAbove,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check delivery availability for coordinates (authenticated)
 */
router.post(
  "/check-delivery",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          error: "Latitude and longitude are required",
        });
        return;
      }

      const validation = await deliveryService.validateDeliveryZone({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get available delivery slots for a date (authenticated)
 */
router.get(
  "/delivery-slots",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query;
      const targetDate = date as string || new Date().toISOString().split("T")[0];

      const slots = await deliveryService.getAvailableSlots(targetDate);

      res.json({
        success: true,
        data: {
          date: targetDate,
          slots,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
