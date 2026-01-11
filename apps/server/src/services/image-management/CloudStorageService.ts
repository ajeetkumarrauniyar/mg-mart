import { v2 as cloudinary } from 'cloudinary';
import {
    CloudStorageService as ICloudStorageService,
    ProcessedImage,
    DiscoveredImage,
    ImageMetadata,
    StorageResult,
    BackupResult,
    ImageUrls
} from '../../types/image-management/index.js';

export class CloudStorageService implements ICloudStorageService {
    private readonly folderPrefix: string = 'mg-mart/products';
    private readonly backupFolder: string = 'mg-mart/backups';

    constructor() {
        // Configure Cloudinary
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret
            });
        } else {
            console.warn('Cloudinary configuration missing. Cloud storage will be simulated.');
        }
    }

    async uploadImage(image: ProcessedImage, metadata: ImageMetadata): Promise<StorageResult> {
        try {
            if (!this.isConfigured()) {
                return this.simulateUpload(image, metadata);
            }

            // Generate unique public ID
            const publicId = `${this.folderPrefix}/${image.originalImageId}_${Date.now()}`;

            // Upload main image
            const uploadResult = await cloudinary.uploader.upload(image.cloudStorageUrl || metadata.sourceUrl, {
                public_id: publicId,
                folder: this.folderPrefix,
                resource_type: 'image',
                format: 'auto',
                quality: 'auto:good',
                fetch_format: 'auto',
                flags: 'progressive',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            });

            // Generate optimized URLs for different sizes
            const urls = await this.generateOptimizedUrls({
                publicId: uploadResult.public_id,
                secureUrl: uploadResult.secure_url,
                urls: {} as ImageUrls,
                metadata: {
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    bytes: uploadResult.bytes
                }
            });

            return {
                publicId: uploadResult.public_id,
                secureUrl: uploadResult.secure_url,
                urls,
                metadata: {
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    bytes: uploadResult.bytes
                }
            };

        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generateOptimizedUrls(storageResult: StorageResult): Promise<ImageUrls> {
        try {
            if (!this.isConfigured()) {
                return this.simulateUrls(storageResult);
            }

            const baseUrl = storageResult.secureUrl;
            const publicId = storageResult.publicId;

            return {
                original: baseUrl,
                thumbnail: cloudinary.url(publicId, {
                    width: 200,
                    height: 200,
                    crop: 'fill',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                }),
                small: cloudinary.url(publicId, {
                    width: 400,
                    height: 400,
                    crop: 'limit',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                }),
                medium: cloudinary.url(publicId, {
                    width: 800,
                    height: 800,
                    crop: 'limit',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                }),
                large: cloudinary.url(publicId, {
                    width: 1200,
                    height: 1200,
                    crop: 'limit',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                })
            };

        } catch (error) {
            console.error('Error generating optimized URLs:', error);
            throw new Error(`Failed to generate optimized URLs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteImage(imageId: string): Promise<boolean> {
        try {
            if (!this.isConfigured()) {
                console.log(`Simulated deletion of image: ${imageId}`);
                return true;
            }

            const result = await cloudinary.uploader.destroy(imageId);
            return result.result === 'ok';

        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            return false;
        }
    }

    async createBackup(originalImage: DiscoveredImage): Promise<BackupResult> {
        try {
            if (!this.isConfigured()) {
                return this.simulateBackup(originalImage);
            }

            const backupPublicId = `${this.backupFolder}/${originalImage.id}_${Date.now()}`;

            const uploadResult = await cloudinary.uploader.upload(originalImage.sourceUrl, {
                public_id: backupPublicId,
                folder: this.backupFolder,
                resource_type: 'image',
                format: 'auto',
                quality: 'auto:best', // Keep original quality for backup
                tags: ['backup', 'original']
            });

            return {
                backupId: uploadResult.public_id,
                backupUrl: uploadResult.secure_url,
                createdAt: new Date()
            };

        } catch (error) {
            console.error('Error creating backup:', error);
            throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Advanced upload with transformations
    async uploadWithTransformations(
        imageUrl: string,
        transformations: any[] = [],
        options: any = {}
    ): Promise<StorageResult> {
        try {
            if (!this.isConfigured()) {
                throw new Error('Cloudinary not configured');
            }

            const publicId = options.publicId || `${this.folderPrefix}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const uploadResult = await cloudinary.uploader.upload(imageUrl, {
                public_id: publicId,
                folder: this.folderPrefix,
                resource_type: 'image',
                transformation: transformations,
                ...options
            });

            const urls = await this.generateOptimizedUrls({
                publicId: uploadResult.public_id,
                secureUrl: uploadResult.secure_url,
                urls: {} as ImageUrls,
                metadata: {
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    bytes: uploadResult.bytes
                }
            });

            return {
                publicId: uploadResult.public_id,
                secureUrl: uploadResult.secure_url,
                urls,
                metadata: {
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    bytes: uploadResult.bytes
                }
            };

        } catch (error) {
            console.error('Error uploading with transformations:', error);
            throw new Error(`Failed to upload with transformations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Batch operations
    async uploadMultipleImages(images: ProcessedImage[]): Promise<StorageResult[]> {
        const results: StorageResult[] = [];
        const errors: string[] = [];

        for (const image of images) {
            try {
                const result = await this.uploadImage(image, image.metadata);
                results.push(result);
            } catch (error) {
                const errorMessage = `Failed to upload image ${image.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                console.error(errorMessage);
                errors.push(errorMessage);
            }
        }

        if (errors.length > 0) {
            console.warn(`Batch upload completed with ${errors.length} errors:`, errors);
        }

        return results;
    }

    async deleteMultipleImages(imageIds: string[]): Promise<{ deleted: string[]; failed: string[] }> {
        const deleted: string[] = [];
        const failed: string[] = [];

        for (const imageId of imageIds) {
            try {
                const success = await this.deleteImage(imageId);
                if (success) {
                    deleted.push(imageId);
                } else {
                    failed.push(imageId);
                }
            } catch (error) {
                console.error(`Failed to delete image ${imageId}:`, error);
                failed.push(imageId);
            }
        }

        return { deleted, failed };
    }

    // Utility methods
    async getImageInfo(publicId: string): Promise<any> {
        try {
            if (!this.isConfigured()) {
                throw new Error('Cloudinary not configured');
            }

            return await cloudinary.api.resource(publicId);
        } catch (error) {
            console.error('Error getting image info:', error);
            throw new Error(`Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async listImages(folder: string = this.folderPrefix, maxResults: number = 100): Promise<any[]> {
        try {
            if (!this.isConfigured()) {
                return [];
            }

            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: folder,
                max_results: maxResults
            });

            return result.resources;
        } catch (error) {
            console.error('Error listing images:', error);
            return [];
        }
    }

    async getStorageUsage(): Promise<{ used: number; limit: number; percentage: number }> {
        try {
            if (!this.isConfigured()) {
                return { used: 0, limit: 0, percentage: 0 };
            }

            const usage = await cloudinary.api.usage();
            return {
                used: usage.storage.used_bytes || 0,
                limit: usage.storage.limit || 0,
                percentage: usage.storage.used_percent || 0
            };
        } catch (error) {
            console.error('Error getting storage usage:', error);
            return { used: 0, limit: 0, percentage: 0 };
        }
    }

    // Configuration and health checks
    private isConfigured(): boolean {
        return !!(
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        );
    }

    async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
        try {
            if (!this.isConfigured()) {
                return {
                    status: 'unhealthy',
                    message: 'Cloudinary configuration missing'
                };
            }

            // Test API connectivity
            await cloudinary.api.ping();

            return {
                status: 'healthy',
                message: 'Cloudinary connection successful'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: `Cloudinary connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    // Simulation methods for development/testing
    private simulateUpload(image: ProcessedImage, metadata: ImageMetadata): StorageResult {
        const simulatedId = `simulated_${image.id}_${Date.now()}`;
        const baseUrl = `https://simulated-cdn.example.com/${simulatedId}`;

        return {
            publicId: simulatedId,
            secureUrl: baseUrl,
            urls: this.simulateUrls({
                publicId: simulatedId,
                secureUrl: baseUrl,
                urls: {} as ImageUrls,
                metadata: {
                    width: metadata.dimensions.width,
                    height: metadata.dimensions.height,
                    format: metadata.format,
                    bytes: metadata.fileSize
                }
            }),
            metadata: {
                width: metadata.dimensions.width,
                height: metadata.dimensions.height,
                format: metadata.format,
                bytes: metadata.fileSize
            }
        };
    }

    private simulateUrls(storageResult: StorageResult): ImageUrls {
        const baseUrl = storageResult.secureUrl;
        return {
            original: baseUrl,
            thumbnail: `${baseUrl}?w=200&h=200`,
            small: `${baseUrl}?w=400&h=400`,
            medium: `${baseUrl}?w=800&h=800`,
            large: `${baseUrl}?w=1200&h=1200`
        };
    }

    private simulateBackup(originalImage: DiscoveredImage): BackupResult {
        return {
            backupId: `backup_${originalImage.id}_${Date.now()}`,
            backupUrl: `https://simulated-backup.example.com/${originalImage.id}`,
            createdAt: new Date()
        };
    }
}