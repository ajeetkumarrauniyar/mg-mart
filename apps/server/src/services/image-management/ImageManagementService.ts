import {
    ImageManagementService as IImageManagementService,
    ProcessingStatus,
    ProcessingStage,
    ProcessingStatusType,
    ProductIdentifier,
    DiscoveredImage,
    ApprovedImage,
    ProcessedImage,
    ProcessingError
} from '../../types/image-management/index.js';
import { ImageDiscoveryService } from './ImageDiscoveryService.js';
import { ImageProcessingService } from './ImageProcessingService.js';
import { CloudStorageService } from './CloudStorageService.js';
import { ImageRepository } from '../../repositories/image-management/ImageRepository.js';
import { ProductImage, ImageProcessingJob } from '../../models/ProductImage.js';
import { ProductRepository } from '../../repositories/ProductRepository.js';

export class ImageManagementService implements IImageManagementService {
    private readonly discoveryService: ImageDiscoveryService;
    private readonly processingService: ImageProcessingService;
    private readonly storageService: CloudStorageService;
    private readonly imageRepository: ImageRepository;
    private readonly productRepository: ProductRepository;
    private readonly maxRetries: number = 3;
    private readonly retryDelayMs: number = 1000;

    constructor() {
        this.discoveryService = new ImageDiscoveryService();
        this.processingService = new ImageProcessingService();
        this.storageService = new CloudStorageService();
        this.imageRepository = new ImageRepository();
        this.productRepository = new ProductRepository();
    }

    async processProductImages(productId: string): Promise<ProcessingStatus> {
        console.log(`Starting image processing for product: ${productId}`);

        // Create initial processing status
        const processingStatus: ProcessingStatus = {
            productId,
            stage: ProcessingStage.DISCOVERY,
            status: ProcessingStatusType.IN_PROGRESS,
            discoveredImages: [],
            approvedImages: [],
            processedImages: [],
            errors: [],
            timestamps: {
                discoveryStarted: new Date()
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Create processing job record
        const job = ImageProcessingJob.fromProcessingStatus(processingStatus);
        const jobId = await this.imageRepository.createProcessingJob(job);

        try {
            // Step 1: Discover images
            const productIdentifiers = await this.getProductIdentifiers(productId);
            const discoveredImages = await this.discoveryService.searchImages(productIdentifiers);

            if (discoveredImages.length === 0) {
                processingStatus.status = ProcessingStatusType.COMPLETED;
                processingStatus.stage = ProcessingStage.COMPLETED;
                processingStatus.timestamps.discoveryCompleted = new Date();
                processingStatus.errors.push({
                    stage: ProcessingStage.DISCOVERY,
                    errorType: 'NO_IMAGES_FOUND',
                    message: 'No images found for the given product identifiers',
                    timestamp: new Date(),
                    retryCount: 0
                });

                await this.updateProcessingJob(jobId, processingStatus);
                return processingStatus;
            }

            // Rank and filter images
            const rankedImages = this.discoveryService.rankImagesByRelevance(discoveredImages, productIdentifiers[0] || {
                productName: `Product ${productId}`,
                displayName: `Display Product ${productId}`,
                category: 'general',
                brand: 'MG Mart'
            });
            processingStatus.discoveredImages = rankedImages.slice(0, 5); // Limit to top 5
            processingStatus.timestamps.discoveryCompleted = new Date();
            processingStatus.stage = ProcessingStage.APPROVAL_PENDING;
            processingStatus.updatedAt = new Date();

            await this.updateProcessingJob(jobId, processingStatus);

            console.log(`Discovered ${processingStatus.discoveredImages.length} images for product ${productId}`);
            return processingStatus;

        } catch (error) {
            console.error(`Error processing images for product ${productId}:`, error);

            processingStatus.status = ProcessingStatusType.FAILED;
            processingStatus.stage = ProcessingStage.FAILED;
            processingStatus.errors.push({
                stage: processingStatus.stage,
                errorType: 'PROCESSING_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: {
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    errorStack: error instanceof Error ? error.stack : undefined
                },
                timestamp: new Date(),
                retryCount: 0
            });
            processingStatus.updatedAt = new Date();

            await this.updateProcessingJob(jobId, processingStatus);
            return processingStatus;
        }
    }

    async approveImages(productId: string, approvedImageIds: string[], approvedBy: string): Promise<ProcessingStatus> {
        console.log(`Approving images for product ${productId}:`, approvedImageIds);

        const processingStatus = await this.getProcessingStatus(productId);
        if (!processingStatus) {
            throw new Error(`No processing status found for product ${productId}`);
        }

        if (processingStatus.stage !== ProcessingStage.APPROVAL_PENDING) {
            throw new Error(`Product ${productId} is not in approval pending stage`);
        }

        try {
            // Create approved images list
            const approvedImages: ApprovedImage[] = approvedImageIds.map((imageId, index) => ({
                discoveredImageId: imageId,
                productId,
                approvedBy,
                approvedAt: new Date(),
                isPrimary: index === 0, // First approved image is primary
                displayOrder: index
            }));

            processingStatus.approvedImages = approvedImages;
            processingStatus.stage = ProcessingStage.PROCESSING;
            processingStatus.status = ProcessingStatusType.IN_PROGRESS;
            processingStatus.timestamps.approvalPending = new Date();
            processingStatus.timestamps.processingStarted = new Date();
            processingStatus.updatedAt = new Date();

            // Get processing job
            const job = await this.imageRepository.getProcessingJobByProductId(productId);
            if (job) {
                await this.updateProcessingJob(job.id, processingStatus);
            }

            // Process approved images
            await this.processApprovedImages(processingStatus);

            return processingStatus;

        } catch (error) {
            console.error(`Error approving images for product ${productId}:`, error);

            processingStatus.status = ProcessingStatusType.FAILED;
            processingStatus.stage = ProcessingStage.FAILED;
            processingStatus.errors.push({
                stage: ProcessingStage.PROCESSING,
                errorType: 'APPROVAL_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: {
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    errorStack: error instanceof Error ? error.stack : undefined
                },
                timestamp: new Date(),
                retryCount: 0
            });
            processingStatus.updatedAt = new Date();

            const job = await this.imageRepository.getProcessingJobByProductId(productId);
            if (job) {
                await this.updateProcessingJob(job.id, processingStatus);
            }

            throw error;
        }
    }

    async getProcessingStatus(productId: string): Promise<ProcessingStatus | null> {
        try {
            const job = await this.imageRepository.getProcessingJobByProductId(productId);
            if (!job) {
                return null;
            }

            return {
                productId: job.productId,
                stage: job.stage,
                status: job.status,
                discoveredImages: job.discoveredImages,
                approvedImages: job.approvedImages,
                processedImages: job.processedImages,
                errors: job.errorLog,
                timestamps: {}, // TODO: Extract from job data
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            };
        } catch (error) {
            console.error(`Error getting processing status for product ${productId}:`, error);
            return null;
        }
    }

    async retryFailedProcessing(productId: string): Promise<ProcessingStatus> {
        console.log(`Retrying failed processing for product: ${productId}`);

        const processingStatus = await this.getProcessingStatus(productId);
        if (!processingStatus) {
            throw new Error(`No processing status found for product ${productId}`);
        }

        if (processingStatus.status !== ProcessingStatusType.FAILED) {
            throw new Error(`Product ${productId} is not in failed state`);
        }

        // Reset status and retry
        processingStatus.status = ProcessingStatusType.IN_PROGRESS;
        processingStatus.updatedAt = new Date();

        // Determine which stage to retry from
        if (processingStatus.approvedImages.length > 0) {
            processingStatus.stage = ProcessingStage.PROCESSING;
            return await this.withExponentialBackoff(() => this.processApprovedImages(processingStatus));
        } else if (processingStatus.stage === ProcessingStage.DISCOVERY || processingStatus.discoveredImages.length === 0 || processingStatus.discoveredImages.length > 0) {
            processingStatus.stage = ProcessingStage.DISCOVERY;
            return await this.withExponentialBackoff(() => this.processProductImages(productId));
        } else {
            throw new Error(`Cannot determine retry strategy for product ${productId}`);
        }
    }

    async cleanupTemporaryImages(productId: string): Promise<void> {
        console.log(`Cleaning up temporary images for product: ${productId}`);

        try {
            const processingStatus = await this.getProcessingStatus(productId);
            if (!processingStatus) {
                return;
            }

            // Clean up discovered images that weren't processed
            const unprocessedImages = processingStatus.discoveredImages.filter(
                discovered => !processingStatus.processedImages.some(
                    processed => processed.originalImageId === discovered.id
                )
            );

            console.log(`Cleaning up ${unprocessedImages.length} unprocessed images`);

            // In a real implementation, you would clean up temporary files/URLs here
            // For now, we'll just log the cleanup

        } catch (error) {
            console.error(`Error cleaning up temporary images for product ${productId}:`, error);
        }
    }

    // Private helper methods
    private async processApprovedImages(processingStatus: ProcessingStatus): Promise<ProcessingStatus> {
        const processedImages: ProcessedImage[] = [];
        const errors: ProcessingError[] = [];

        for (const approvedImage of processingStatus.approvedImages) {
            try {
                // Find the discovered image
                const discoveredImage = processingStatus.discoveredImages.find(
                    img => img.id === approvedImage.discoveredImageId
                );

                if (!discoveredImage) {
                    throw new Error(`Discovered image not found: ${approvedImage.discoveredImageId}`);
                }

                // Create backup
                const backup = await this.storageService.createBackup(discoveredImage);
                console.log(`Created backup for image ${discoveredImage.id}: ${backup.backupId}`);

                // Process the image
                const processedImage = await this.processingService.processImage(discoveredImage);
                processedImage.backupUrl = backup.backupUrl;

                // Upload to cloud storage
                const storageResult = await this.storageService.uploadImage(processedImage, processedImage.metadata);
                processedImage.cloudStorageUrl = storageResult.secureUrl;
                processedImage.thumbnailUrl = storageResult.urls.thumbnail;
                processedImage.optimizedUrl = storageResult.urls.medium;

                processedImages.push(processedImage);

                // Create ProductImage record
                const productImage = ProductImage.fromProcessedImage(processedImage, processingStatus.productId);
                productImage.isPrimary = approvedImage.isPrimary;
                productImage.displayOrder = approvedImage.displayOrder;

                await this.imageRepository.createProductImage(productImage);

                console.log(`Successfully processed and stored image ${discoveredImage.id}`);

            } catch (error) {
                const processingError: ProcessingError = {
                    stage: ProcessingStage.PROCESSING,
                    errorType: 'IMAGE_PROCESSING_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: {
                        approvedImageId: approvedImage.discoveredImageId,
                        errorMessage: error instanceof Error ? error.message : 'Unknown error',
                        errorStack: error instanceof Error ? error.stack : undefined
                    },
                    timestamp: new Date(),
                    retryCount: 0
                };
                errors.push(processingError);
                console.error(`Error processing image ${approvedImage.discoveredImageId}:`, error);
            }
        }

        // Update processing status
        processingStatus.processedImages = processedImages;
        processingStatus.errors.push(...errors);
        processingStatus.timestamps.processingCompleted = new Date();
        processingStatus.timestamps.storageCompleted = new Date();

        if (processedImages.length > 0) {
            processingStatus.status = ProcessingStatusType.COMPLETED;
            processingStatus.stage = ProcessingStage.COMPLETED;
        } else {
            processingStatus.status = ProcessingStatusType.FAILED;
            processingStatus.stage = ProcessingStage.FAILED;
        }

        processingStatus.updatedAt = new Date();

        // Update job record
        const job = await this.imageRepository.getProcessingJobByProductId(processingStatus.productId);
        if (job) {
            await this.updateProcessingJob(job.id, processingStatus);
        }

        return processingStatus;
    }

    private async getProductIdentifiers(productId: string): Promise<ProductIdentifier[]> {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error(`Product not found: ${productId}`);
        }

        // Clean product name by removing price markers like " 70/-" or " 153/-"
        const cleanName = product.name.replace(/\s*\d+\/-\s*$/, '').trim();

        return [{
            productName: cleanName,
            displayName: cleanName,
            category: product.category,
            brand: '' // Removed 'MG Mart' to prevent skewing Google search results towards the local store
        }];
    }

    private async updateProcessingJob(jobId: string, processingStatus: ProcessingStatus): Promise<void> {
        try {
            await this.imageRepository.updateProcessingJob(jobId, {
                status: processingStatus.status,
                stage: processingStatus.stage,
                discoveredImages: processingStatus.discoveredImages,
                approvedImages: processingStatus.approvedImages,
                processedImages: processingStatus.processedImages,
                errorLog: processingStatus.errors,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating processing job:', error);
        }
    }

    // Utility methods
    async getProcessingStatistics(): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        failed: number;
    }> {
        try {
            const [pending, inProgress, completed, failed] = await Promise.all([
                this.imageRepository.getProcessingJobsByStatus(ProcessingStatusType.PENDING),
                this.imageRepository.getProcessingJobsByStatus(ProcessingStatusType.IN_PROGRESS),
                this.imageRepository.getProcessingJobsByStatus(ProcessingStatusType.COMPLETED),
                this.imageRepository.getProcessingJobsByStatus(ProcessingStatusType.FAILED)
            ]);

            return {
                total: pending.length + inProgress.length + completed.length + failed.length,
                pending: pending.length,
                inProgress: inProgress.length,
                completed: completed.length,
                failed: failed.length
            };
        } catch (error) {
            console.error('Error getting processing statistics:', error);
            return { total: 0, pending: 0, inProgress: 0, completed: 0, failed: 0 };
        }
    }

    async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; services: any }> {
        const storageHealth = await this.storageService.healthCheck();

        return {
            status: storageHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
            services: {
                storage: storageHealth,
                discovery: { status: 'healthy', message: 'Discovery service operational' },
                processing: { status: 'healthy', message: 'Processing service operational' }
            }
        };
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async withExponentialBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelayMs: number = 1000
    ): Promise<T> {
        let lastError: Error | unknown;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    const delayMs = Math.min(baseDelayMs * Math.pow(2, attempt), 30000);
                    console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms delay`);
                    await ImageManagementService.sleep(delayMs);
                }
            }
        }
        throw lastError;
    }
}