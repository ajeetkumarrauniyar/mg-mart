/**
 * Category Sync Queue routes for MG Mart grocery application
 *
 * Admin-only: review category conflicts raised by working-sync.js
 */

import { Router } from "express";
import { CategorySyncQueueController } from "../controllers/CategorySyncQueueController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router: Router = Router();
const controller = new CategorySyncQueueController();

router.get("/", authenticateToken, requireAdmin, controller.getPending);
router.post("/:productId/approve", authenticateToken, requireAdmin, controller.approve);
router.post("/:productId/deny", authenticateToken, requireAdmin, controller.deny);

export default router;