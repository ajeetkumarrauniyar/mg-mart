/**
 * Category Sync Queue Repository
 *
 * Reads and resolves the conflicts that working-sync.js (BUSY -> Firebase
 * sync script) writes when it finds a product whose category was manually
 * set by an admin and now disagrees with BUSY's category. Nothing here
 * writes to `products` except approve()/deny(), and only in response to an
 * explicit admin decision — the sync script itself never applies a
 * conflicting category on its own.
 */

import { getDb, COLLECTIONS, createTimestamp } from "../services/firebase.js";
import { ProductCategory } from "../models/Product.js";

export interface CategorySyncConflict {
    productId: string;
    productName: string;
    currentCategory: string;
    busyCategory: string;
    status: "pending" | "approved" | "denied";
    detectedAt: string | null;
}

export class CategorySyncQueueRepository {
    private collection = getDb().collection(COLLECTIONS.CATEGORY_SYNC_QUEUE);
    private productsCollection = getDb().collection(COLLECTIONS.PRODUCTS);

    /** All conflicts currently awaiting an admin decision. */
    async listPending(): Promise<CategorySyncConflict[]> {
        const snapshot = await this.collection
            .where("status", "==", "pending")
            .orderBy("detectedAt", "desc")
            .get();

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                productId: data.productId,
                productName: data.productName,
                currentCategory: data.currentCategory,
                busyCategory: data.busyCategory,
                status: data.status,
                detectedAt: data.detectedAt ? data.detectedAt.toDate().toISOString() : null,
            };
        });
    }

    /**
     * Admin accepts BUSY's category. The product's live category is updated
     * to BUSY's value, and categoryManuallySet is cleared so future syncs
     * apply BUSY changes automatically again (until the admin overrides it
     * again).
     */
    async approve(productId: string, resolvedBy: string): Promise<void> {
        const queueRef = this.collection.doc(productId);
        const queueDoc = await queueRef.get();
        if (!queueDoc.exists) {
            throw new Error("No pending category sync conflict for this product");
        }

        const { busyCategory } = queueDoc.data() as { busyCategory: ProductCategory };

        await this.productsCollection.doc(productId).update({
            category: busyCategory,
            categoryManuallySet: false,
            updatedAt: createTimestamp(),
        });

        await queueRef.update({
            status: "approved",
            resolvedAt: createTimestamp(),
            resolvedBy,
        });
    }

    /**
     * Admin rejects BUSY's category. The live category and
     * categoryManuallySet are left untouched, so the product keeps its
     * current (admin-chosen) category. working-sync.js only re-queues a
     * product while its queue doc is still `pending`, so once denied this
     * specific conflict will not be raised again — if BUSY's category
     * changes further, that becomes a new conflict and queues fresh.
     */
    async deny(productId: string, resolvedBy: string): Promise<void> {
        const queueRef = this.collection.doc(productId);
        const queueDoc = await queueRef.get();
        if (!queueDoc.exists) {
            throw new Error("No pending category sync conflict for this product");
        }

        await queueRef.update({
            status: "denied",
            resolvedAt: createTimestamp(),
            resolvedBy,
        });
    }
}