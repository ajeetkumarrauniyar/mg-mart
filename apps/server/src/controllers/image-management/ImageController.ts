import { Request, Response } from 'express';
import { ImageManagementService } from '../../services/image-management/ImageManagementService.js';
import { ImageRepository } from '../../repositories/image-management/ImageRepository.js';
import { ProcessingStatusType, ProcessingStage } from '../../types/image-management/index.js';

export class ImageController {
    private _imageManagementService?: ImageManagementService;
    private _imageRepository?: ImageRepository;

    constructor() {
        // Services will be initialized lazily when first accessed
    }

    private get imageManagementService(): ImageManagementService {
        if (!this._imageManagementService) {
            this._imageManagementService = new ImageManagementService();
        }
        return this._imageManagementService;
    }

    private get imageRepository(): ImageRepository {
        if (!this._imageRepository) {
            this._imageRepository = new ImageRepository();
        }
        return this._imageRepository;
    }

    // POST /api/products/:id/discover-images
    async discoverImages(req: Request, res: Response): Promise<void> {
        try {
            const { id: productId } = req.params as Record<string, string>;

            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: 'Product ID is required'
                });
                return;
            }

            console.log(`Starting image discovery for product: ${productId}`);

            // Check if there's already a processing job for this product
            const existingStatus = await this.imageManagementService.getProcessingStatus(productId);
            if (existingStatus && existingStatus.status === ProcessingStatusType.IN_PROGRESS) {
                res.status(409).json({
                    success: false,
                    error: 'Image discovery already in progress for this product',
                    data: existingStatus
                });
                return;
            }

            // Start image discovery process
            const processingStatus = await this.imageManagementService.processProductImages(productId);

            res.status(200).json({
                success: true,
                message: 'Image discovery completed',
                data: {
                    productId,
                    status: processingStatus.status,
                    stage: processingStatus.stage,
                    discoveredImages: processingStatus.discoveredImages,
                    timestamps: processingStatus.timestamps
                }
            });

        } catch (error) {
            console.error('Error in discoverImages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to discover images',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // GET /api/products/:id/processing-status
    async getProcessingStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id: productId } = req.params as Record<string, string>;

            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: 'Product ID is required'
                });
                return;
            }

            const processingStatus = await this.imageManagementService.getProcessingStatus(productId);

            if (!processingStatus) {
                res.status(404).json({
                    success: false,
                    error: 'No processing status found for this product'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: processingStatus
            });

        } catch (error) {
            console.error('Error in getProcessingStatus:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get processing status',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // POST /api/products/:id/approve-images
    async approveImages(req: Request, res: Response): Promise<void> {
        try {
            const { id: productId } = req.params as Record<string, string>;
            const { imageIds } = req.body;
            const approvedBy = req.user?.userId || req.body?.approvedBy;

            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: 'Product ID is required'
                });
                return;
            }

            if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Image IDs array is required and must not be empty'
                });
                return;
            }

            if (!approvedBy) {
                res.status(400).json({
                    success: false,
                    error: 'Approved by user ID is required'
                });
                return;
            }

            console.log(`Approving images for product ${productId}:`, imageIds);

            const processingStatus = await this.imageManagementService.approveImages(
                productId,
                imageIds,
                approvedBy
            );

            res.status(200).json({
                success: true,
                message: 'Images approved and processing started',
                data: {
                    productId,
                    status: processingStatus.status,
                    stage: processingStatus.stage,
                    approvedImages: processingStatus.approvedImages,
                    processedImages: processingStatus.processedImages
                }
            });

        } catch (error) {
            console.error('Error in approveImages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to approve images',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // DELETE /api/products/:productId/images/:imageId
    async deleteProductImage(req: Request, res: Response): Promise<void> {
        try {
            const { productId, imageId } = req.params as Record<string, string>;

            if (!productId || !imageId) {
                res.status(400).json({
                    success: false,
                    error: 'Product ID and Image ID are required'
                });
                return;
            }

            // Get the image to verify it belongs to the product
            const productImage = await this.imageRepository.getProductImageById(imageId);

            if (!productImage) {
                res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
                return;
            }

            if (productImage.productId !== productId) {
                res.status(403).json({
                    success: false,
                    error: 'Image does not belong to the specified product'
                });
                return;
            }

            // Delete from repository
            await this.imageRepository.deleteProductImage(imageId);

            console.log(`Deleted image ${imageId} for product ${productId}`);

            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });

        } catch (error) {
            console.error('Error in deleteProductImage:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete image',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // GET /api/products/:id/images
    async getProductImages(req: Request, res: Response): Promise<void> {
        try {
            const { id: productId } = req.params as Record<string, string>;

            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: 'Product ID is required'
                });
                return;
            }

            const images = await this.imageRepository.getProductImagesByProductId(productId);

            res.status(200).json({
                success: true,
                data: {
                    productId,
                    images,
                    count: images.length
                }
            });

        } catch (error) {
            console.error('Error in getProductImages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get product images',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // PUT /api/products/:productId/images/:imageId/primary
    async setPrimaryImage(req: Request, res: Response): Promise<void> {
        try {
            const { productId, imageId } = req.params as Record<string, string>;

            if (!productId || !imageId) {
                res.status(400).json({
                    success: false,
                    error: 'Product ID and Image ID are required'
                });
                return;
            }

            // Verify the image exists and belongs to the product
            const productImage = await this.imageRepository.getProductImageById(imageId);

            if (!productImage) {
                res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
                return;
            }

            if (productImage.productId !== productId) {
                res.status(403).json({
                    success: false,
                    error: 'Image does not belong to the specified product'
                });
                return;
            }

            // Set as primary image
            await this.imageRepository.setPrimaryImage(productId, imageId);

            res.status(200).json({
                success: true,
                message: 'Primary image updated successfully'
            });

        } catch (error) {
            console.error('Error in setPrimaryImage:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to set primary image',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // POST /api/products/:id/retry-processing
    async retryProcessing(req: Request, res: Response): Promise<void> {
        try {
            const { id: productId } = req.params as Record<string, string>;

            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: 'Product ID is required'
                });
                return;
            }

            console.log(`Retrying image processing for product: ${productId}`);

            const processingStatus = await this.imageManagementService.retryFailedProcessing(productId);

            res.status(200).json({
                success: true,
                message: 'Image processing retry started',
                data: processingStatus
            });

        } catch (error) {
            console.error('Error in retryProcessing:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retry processing',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // GET /api/image-management/statistics
    async getStatistics(req: Request, res: Response): Promise<void> {
        try {
            const statistics = await this.imageManagementService.getProcessingStatistics();

            res.status(200).json({
                success: true,
                data: statistics
            });

        } catch (error) {
            console.error('Error in getStatistics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get statistics',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // GET /api/image-management/health
    async healthCheck(req: Request, res: Response): Promise<void> {
        try {
            const health = await this.imageManagementService.healthCheck();

            const statusCode = health.status === 'healthy' ? 200 : 503;

            res.status(statusCode).json({
                success: health.status === 'healthy',
                data: health
            });

        } catch (error) {
            console.error('Error in healthCheck:', error);
            res.status(503).json({
                success: false,
                error: 'Health check failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // POST /api/image-management/cleanup
    async cleanupTemporaryImages(req: Request, res: Response): Promise<void> {
        try {
            const { productId } = req.body;

            if (productId) {
                // Clean up for specific product
                await this.imageManagementService.cleanupTemporaryImages(productId);
                res.status(200).json({
                    success: true,
                    message: `Cleanup completed for product ${productId}`
                });
            } else {
                // Clean up old processing jobs
                const cleanedCount = await this.imageRepository.cleanupOldProcessingJobs(7);
                res.status(200).json({
                    success: true,
                    message: `Cleaned up ${cleanedCount} old processing jobs`
                });
            }

        } catch (error) {
            console.error('Error in cleanupTemporaryImages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to cleanup temporary images',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}