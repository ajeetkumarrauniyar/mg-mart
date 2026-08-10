/**
 *
 * Admin-only endpoints for reviewing category conflicts raised by the
 * BUSY sync script (working-sync.js) when it finds a manually-set
 * category that disagrees with BUSY's data.
 */

import { Request, Response, NextFunction } from "express";
import { CategorySyncQueueRepository } from "../repositories/CategorySyncQueueRepository.js";
import { ApiError } from "../utils/errorHandler.js";

export class CategorySyncQueueController {
    private repository: CategorySyncQueueRepository;

    constructor() {
        this.repository = new CategorySyncQueueRepository();
    }

    getPending = async (
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const conflicts = await this.repository.listPending();
            res.json({ success: true, data: conflicts });
        } catch (error) {
            next(error);
        }
    };

    approve = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { productId } = req.params as Record<string, string>;
            if (!productId) {
                next(new ApiError("Product ID is required", 400));
                return;
            }
            const resolvedBy = req.user?.userId || "unknown-admin";
            await this.repository.approve(productId, resolvedBy);
            res.json({ success: true, message: "Category updated to BUSY value" });
        } catch (error) {
            if (error instanceof Error) {
                next(new ApiError(error.message, 404));
                return;
            }
            next(error);
        }
    };

    deny = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { productId } = req.params as Record<string, string>;
            if (!productId) {
                next(new ApiError("Product ID is required", 400));
                return;
            }
            const resolvedBy = req.user?.userId || "unknown-admin";
            await this.repository.deny(productId, resolvedBy);
            res.json({ success: true, message: "BUSY category change rejected; current category kept" });
        } catch (error) {
            if (error instanceof Error) {
                next(new ApiError(error.message, 404));
                return;
            }
            next(error);
        }
    };
}