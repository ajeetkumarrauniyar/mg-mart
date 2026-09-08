import { api } from "./apiService";
import { config } from "../config";

export interface CategorySyncConflict {
    productId: string;
    productName: string;
    currentCategory: string;
    busyCategory: string;
    status: "pending" | "approved" | "denied";
    detectedAt: string | null;
}

export const categorySyncQueueService = {
    // Products where the BUSY sync found a category conflict awaiting review.
    // api.get already unwraps the { success, data } envelope, so this
    // resolves to the conflict array directly.
    getPending: async (): Promise<CategorySyncConflict[]> => {
        const conflicts = await api.get<CategorySyncConflict[]>(
            config.api.ENDPOINTS.CATEGORY_SYNC_QUEUE.LIST
        );
        return conflicts ?? [];
    },

    // Accept BUSY's category — product's live category updates to it
    approve: async (productId: string): Promise<void> => {
        await api.post(
            config.api.ENDPOINTS.CATEGORY_SYNC_QUEUE.APPROVE(productId)
        );
    },

    // Reject BUSY's category — product keeps its current (admin-set) category
    deny: async (productId: string): Promise<void> => {
        await api.post(
            config.api.ENDPOINTS.CATEGORY_SYNC_QUEUE.DENY(productId)
        );
    },
};