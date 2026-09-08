import { api } from "./apiService";
import { config } from "../config";

/* ─── Server-aligned types ─────────────────────────────────────── */

export interface ProductImage {
    id: string;
    productId?: string;
    cloudStorageUrl?: string;
    thumbnailUrl?: string;
    originalSourceUrl?: string;
    imageUrl?: string;
    url?: string;
    isPrimary?: boolean;
    status?: string;
    source?: string;
    displayOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DiscoveredImage {
    id: string;
    sourceUrl: string;
    thumbnailUrl: string;
    relevanceScore?: number;
    qualityScore?: number;
}

export interface ProcessingStatusResponse {
    productId: string;
    stage: string;
    status: string;
    discoveredImages?: DiscoveredImage[];
    approvedImages?: unknown[];
    processedImages?: unknown[];
    errors?: Array<{ message: string; errorType?: string; stage?: string }>;
    timestamps?: Record<string, string>;
    createdAt?: string;
    updatedAt?: string;
}

export interface DisplayImage {
    id: string;
    url: string;
    thumbnailUrl: string;
    isPrimary: boolean;
    kind: "stored" | "discovered";
    status: string;
    source?: string;
    relevanceScore?: number;
    qualityScore?: number;
    selectable: boolean;
}

export interface DiscoverImagesResponse {
    productId: string;
    status: string;
    stage?: string;
    message?: string;
    discoveredCount?: number;
}

export interface ApproveImagesPayload {
    imageIds: string[];
}

export interface SetPrimaryImageResponse {
    message?: string;
}

export interface ImageManagementStatistics {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
}

export interface ImageManagementHealth {
    status: string;
    services?: Record<string, { status: string; message?: string }>;
    timestamp?: string;
    message?: string;
    details?: string;
}

export interface CleanupResponse {
    message?: string;
    deletedCount?: number;
}

/* ─── Helpers ──────────────────────────────────────────────────── */

const extractApiError = (error: unknown, fallback: string): string => {
    if (!error || typeof error !== "object") return fallback;

    const err = error as {
        message?: string;
        status?: number;
        data?: { error?: string; message?: string; details?: string };
    };

    return (
        err.data?.error ||
        err.data?.message ||
        err.message ||
        fallback
    );
};

const isNotFoundError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;
    return (error as { status?: number }).status === 404;
};

const normalizeStoredImage = (raw: Record<string, unknown>): ProductImage => ({
    id: String(raw.id || raw.imageId || ""),
    productId: raw.productId ? String(raw.productId) : undefined,
    cloudStorageUrl: raw.cloudStorageUrl ? String(raw.cloudStorageUrl) : undefined,
    thumbnailUrl: raw.thumbnailUrl ? String(raw.thumbnailUrl) : undefined,
    originalSourceUrl: raw.originalSourceUrl ? String(raw.originalSourceUrl) : undefined,
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
    url: raw.url ? String(raw.url) : undefined,
    isPrimary: Boolean(raw.isPrimary),
    status: "stored",
    source: raw.originalSourceUrl ? "cloudinary" : "stored",
    displayOrder: typeof raw.displayOrder === "number" ? raw.displayOrder : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
});

const getStoredImageUrl = (image: ProductImage): string =>
    image.cloudStorageUrl || image.thumbnailUrl || image.imageUrl || image.url || image.originalSourceUrl || "";

export const buildDisplayImages = (
    storedImages: ProductImage[],
    processingStatus: ProcessingStatusResponse | null
): DisplayImage[] => {
    const stored = storedImages.map((image) => ({
        id: image.id,
        url: getStoredImageUrl(image),
        thumbnailUrl: image.thumbnailUrl || getStoredImageUrl(image),
        isPrimary: Boolean(image.isPrimary),
        kind: "stored" as const,
        status: image.status || "stored",
        source: image.source || "cloudinary",
        selectable: false,
    }));

    const awaitingApproval = processingStatus?.stage === "approval_pending";
    const discovered = (processingStatus?.discoveredImages || []).map((image) => ({
        id: image.id,
        url: image.sourceUrl || image.thumbnailUrl,
        thumbnailUrl: image.thumbnailUrl || image.sourceUrl,
        isPrimary: false,
        kind: "discovered" as const,
        status: "pending_approval",
        source: "discovery",
        relevanceScore: image.relevanceScore,
        qualityScore: image.qualityScore,
        selectable: awaitingApproval,
    }));

    // Avoid showing duplicates if a discovered image was already stored
    const storedUrls = new Set(stored.map((image) => image.url).filter(Boolean));
    const uniqueDiscovered = discovered.filter(
        (image) => !storedUrls.has(image.url) && !storedUrls.has(image.thumbnailUrl)
    );

    return [...uniqueDiscovered, ...stored];
};

/* ─── Service ──────────────────────────────────────────────────── */

export const imageManagementService = {
    discoverImages: async (productId: string): Promise<DiscoverImagesResponse> => {
        try {
            const data = await api.post<{
                productId: string;
                status: string;
                stage?: string;
                discoveredImages?: DiscoveredImage[];
            }>(config.api.ENDPOINTS.IMAGE_MANAGEMENT.DISCOVER_IMAGES(productId));

            return {
                productId: data.productId || productId,
                status: data.status,
                stage: data.stage,
                message: "Image discovery completed",
                discoveredCount: data.discoveredImages?.length ?? 0,
            };
        } catch (error) {
            if (isNotFoundError(error)) throw new Error("Product not found");
            throw new Error(extractApiError(error, "Failed to discover images"));
        }
    },

    getProcessingStatus: async (
        productId: string
    ): Promise<ProcessingStatusResponse | null> => {
        try {
            const data = await api.get<ProcessingStatusResponse>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.PROCESSING_STATUS(productId)
            );
            return data;
        } catch (error) {
            if (isNotFoundError(error)) return null;
            throw new Error(extractApiError(error, "Failed to load processing status"));
        }
    },

    approveImages: async (
        productId: string,
        payload: ApproveImagesPayload
    ): Promise<{ message?: string }> => {
        try {
            const data = await api.post<{ productId?: string; status?: string; stage?: string }>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.APPROVE_IMAGES(productId),
                payload
            );
            return {
                message: data?.status
                    ? `Approved ${payload.imageIds.length} image(s) — status: ${data.status}`
                    : `Approved ${payload.imageIds.length} image(s)`,
            };
        } catch (error) {
            throw new Error(extractApiError(error, "Failed to approve images"));
        }
    },

    getProductImages: async (productId: string): Promise<ProductImage[]> => {
        try {
            const response = await api.get<unknown>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.PRODUCT_IMAGES(productId)
            );

            let images: unknown[] = [];

            if (Array.isArray(response)) {
                images = response;
            } else if (
                response &&
                typeof response === "object" &&
                "images" in response &&
                Array.isArray((response as { images: unknown[] }).images)
            ) {
                images = (response as { images: unknown[] }).images;
            }

            return images
                .filter((item) => item && typeof item === "object")
                .map((item) => normalizeStoredImage(item as Record<string, unknown>))
                .filter((image) => Boolean(image.id));
        } catch (error) {
            throw new Error(extractApiError(error, "Failed to load product images"));
        }
    },

    deleteProductImage: async (
        productId: string,
        imageId: string
    ): Promise<{ message?: string }> => {
        try {
            const response = await api.delete<{ message?: string }>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.DELETE_PRODUCT_IMAGE(
                    productId,
                    imageId
                )
            );
            return { message: response?.message || "Image deleted successfully" };
        } catch (error) {
            throw new Error(extractApiError(error, "Failed to delete image"));
        }
    },

    setPrimaryImage: async (
        productId: string,
        imageId: string
    ): Promise<SetPrimaryImageResponse> => {
        try {
            const response = await api.put<{ message?: string }>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.SET_PRIMARY_IMAGE(
                    productId,
                    imageId
                )
            );
            return { message: response?.message || "Primary image updated successfully" };
        } catch (error) {
            throw new Error(extractApiError(error, "Failed to set primary image"));
        }
    },

    retryProcessing: async (
        productId: string
    ): Promise<ProcessingStatusResponse> => {
        try {
            const data = await api.post<ProcessingStatusResponse>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.RETRY_PROCESSING(productId)
            );
            return data;
        } catch (error) {
            throw new Error(extractApiError(error, "Failed to retry processing"));
        }
    },

    getStatistics: async (): Promise<ImageManagementStatistics> => {
        try {
            const data = await api.get<Partial<ImageManagementStatistics>>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.STATISTICS
            );
            return {
                total: data.total ?? 0,
                pending: data.pending ?? 0,
                inProgress: data.inProgress ?? 0,
                completed: data.completed ?? 0,
                failed: data.failed ?? 0,
            };
        } catch (error) {
            throw new Error(extractApiError(error, "Failed to fetch image statistics"));
        }
    },

    getHealth: async (): Promise<ImageManagementHealth> => {
        try {
            const data = await api.get<ImageManagementHealth>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.HEALTH
            );
            return data;
        } catch (error) {
            const err = error as {
                data?: { data?: ImageManagementHealth; error?: string; details?: string };
                message?: string;
            };

            if (err.data?.data) return err.data.data;

            return {
                status: "unhealthy",
                message: err.data?.error || err.message || "Health check failed",
                details: err.data?.details,
            };
        }
    },

    cleanupTemporaryImages: async (): Promise<CleanupResponse> => {
        try {
            const response = await api.post<{ message?: string; deletedCount?: number }>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.CLEANUP
            );
            return {
                message: response?.message || "Cleanup completed",
                deletedCount: response?.deletedCount,
            };
        } catch (error) {
            throw new Error(extractApiError(error, "Failed to cleanup temporary images"));
        }
    },
};
