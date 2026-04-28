import { api } from "./apiService";
import { config } from "../config";

export interface ProductImage {
    imageId?: string;
    id?: string;
    imageUrl?: string;
    url?: string;
    isPrimary?: boolean;
    status?: string;
    source?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface DiscoverImagesResponse {
    productId: string;
    status: string;
    message?: string;
}

export interface ProcessingStatusResponse {
    productId: string;
    status: string;
    progress?: number;
    message?: string;
}

export interface ApproveImagesPayload {
    imageIds: string[];
}

export interface SetPrimaryImageResponse {
    productId: string;
    imageId: string;
    isPrimary: boolean;
    message?: string;
}

export interface ImageManagementStatistics {
    totalProducts?: number;
    totalImages?: number;
    pendingApprovals?: number;
    failedProcessing?: number;
    [key: string]: unknown;
}

export interface ImageManagementHealth {
    status: string;
    timestamp?: string;
    [key: string]: unknown;
}

export interface CleanupResponse {
    success?: boolean;
    deletedCount?: number;
    message?: string;
    [key: string]: unknown;
}

export const imageManagementService = {
    discoverImages: async (productId: string): Promise<DiscoverImagesResponse> => {
        return await api.post<DiscoverImagesResponse>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.DISCOVER_IMAGES(productId)
        );
    },

    getProcessingStatus: async (
        productId: string
    ): Promise<ProcessingStatusResponse> => {
        return await api.get<ProcessingStatusResponse>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.PROCESSING_STATUS(productId)
        );
    },

    approveImages: async (
        productId: string,
        payload: ApproveImagesPayload
    ): Promise<{ message?: string }> => {
        return await api.post<{ message?: string }>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.APPROVE_IMAGES(productId),
            payload
        );
    },

    getProductImages: async (productId: string): Promise<ProductImage[]> => {
        const response = await api.get<unknown>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.PRODUCT_IMAGES(productId)
        );

        if (Array.isArray(response)) {
            return response as ProductImage[];
        }

        if (
            response &&
            typeof response === "object" &&
            "images" in response &&
            Array.isArray((response as { images: unknown[] }).images)
        ) {
            return (response as { images: ProductImage[] }).images;
        }

        return [];
    },

    deleteProductImage: async (
        productId: string,
        imageId: string
    ): Promise<{ message?: string }> => {
        return await api.delete<{ message?: string }>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.DELETE_PRODUCT_IMAGE(
                productId,
                imageId
            )
        );
    },

    setPrimaryImage: async (
        productId: string,
        imageId: string
    ): Promise<SetPrimaryImageResponse> => {
        return await api.put<SetPrimaryImageResponse>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.SET_PRIMARY_IMAGE(
                productId,
                imageId
            )
        );
    },

    retryProcessing: async (
        productId: string
    ): Promise<ProcessingStatusResponse> => {
        return await api.post<ProcessingStatusResponse>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.RETRY_PROCESSING(productId)
        );
    },

    getStatistics: async (): Promise<ImageManagementStatistics> => {
        try {
            return await api.get<ImageManagementStatistics>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.STATISTICS
            );
        } catch (error) {
            const err = error as { message?: string };
            throw new Error(err.message || "Failed to fetch image statistics");
        }
    },

    getHealth: async (): Promise<ImageManagementHealth> => {
        try {
            return await api.get<ImageManagementHealth>(
                config.api.ENDPOINTS.IMAGE_MANAGEMENT.HEALTH
            );
        } catch (error) {
            const err = error as {
                data?: { data?: ImageManagementHealth; error?: string; details?: string };
                message?: string;
            };

            if (err.data?.data) {
                return err.data.data;
            }

            return {
                status: "unhealthy",
                message: err.data?.error || err.message || "Health check failed",
                details: err.data?.details,
            };
        }
    },

    cleanupTemporaryImages: async (): Promise<CleanupResponse> => {
        return await api.post<CleanupResponse>(
            config.api.ENDPOINTS.IMAGE_MANAGEMENT.CLEANUP
        );
    },
};
