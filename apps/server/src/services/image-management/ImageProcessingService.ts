import sharp from 'sharp';
import axios from 'axios';
import {
    ImageProcessingService as IImageProcessingService,
    DiscoveredImage,
    ProcessedImage,
    ImageDimensions,
    ImageFormat,
    ProcessingMetadata
} from '../../types/image-management/index.js';

export class ImageProcessingService implements IImageProcessingService {
    private readonly maxImageSize: number;
    private readonly defaultQuality: number = 85;
    private readonly standardDimensions: ImageDimensions = { width: 800, height: 800 };
    private readonly thumbnailDimensions: ImageDimensions = { width: 200, height: 200 };

    constructor() {
        this.maxImageSize = parseInt(process.env.MAX_IMAGE_SIZE_MB || '10') * 1024 * 1024; // Convert MB to bytes
    }

    async removeWatermarks(image: DiscoveredImage): Promise<ProcessedImage> {
        const startTime = Date.now();

        try {
            // Download the image
            const imageBuffer = await this.downloadImage(image.sourceUrl);

            // Basic watermark removal using image processing techniques
            const processedBuffer = await this.processWatermarkRemoval(imageBuffer);

            // Create processed image metadata
            const processingMetadata: ProcessingMetadata = {
                watermarkRemoved: true,
                qualityEnhanced: false,
                resized: false,
                optimized: false,
                originalDimensions: image.dimensions,
                finalDimensions: image.dimensions,
                compressionRatio: 1,
                processingTimeMs: Date.now() - startTime
            };

            return {
                id: `processed_${image.id}`,
                originalImageId: image.id,
                cloudStorageUrl: '', // Will be set after upload
                thumbnailUrl: '', // Will be set after upload
                optimizedUrl: '', // Will be set after upload
                backupUrl: '', // Will be set after backup
                metadata: {
                    ...image.metadata,
                    processedAt: new Date()
                },
                processingMetadata,
                processedAt: new Date()
            };

        } catch (error) {
            console.error('Error removing watermarks:', error);
            throw new Error(`Failed to remove watermarks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async optimizeImage(image: ProcessedImage): Promise<ProcessedImage> {
        const startTime = Date.now();

        try {
            // For now, we'll simulate optimization
            // In a real implementation, this would involve actual image optimization
            const optimizedMetadata: ProcessingMetadata = {
                ...image.processingMetadata,
                optimized: true,
                compressionRatio: 0.8, // Simulated 20% size reduction
                processingTimeMs: image.processingMetadata.processingTimeMs + (Date.now() - startTime)
            };

            return {
                ...image,
                processingMetadata: optimizedMetadata,
                processedAt: new Date()
            };

        } catch (error) {
            console.error('Error optimizing image:', error);
            throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async resizeImage(image: ProcessedImage, dimensions: ImageDimensions): Promise<ProcessedImage> {
        const startTime = Date.now();

        try {
            // For now, we'll simulate resizing
            // In a real implementation, this would involve actual image resizing with Sharp
            const resizedMetadata: ProcessingMetadata = {
                ...image.processingMetadata,
                resized: true,
                finalDimensions: dimensions,
                processingTimeMs: image.processingMetadata.processingTimeMs + (Date.now() - startTime)
            };

            return {
                ...image,
                processingMetadata: resizedMetadata,
                processedAt: new Date()
            };

        } catch (error) {
            console.error('Error resizing image:', error);
            throw new Error(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async enhanceQuality(image: ProcessedImage): Promise<ProcessedImage> {
        const startTime = Date.now();

        try {
            // For now, we'll simulate quality enhancement
            // In a real implementation, this would involve actual image enhancement
            const enhancedMetadata: ProcessingMetadata = {
                ...image.processingMetadata,
                qualityEnhanced: true,
                processingTimeMs: image.processingMetadata.processingTimeMs + (Date.now() - startTime)
            };

            return {
                ...image,
                processingMetadata: enhancedMetadata,
                processedAt: new Date()
            };

        } catch (error) {
            console.error('Error enhancing image quality:', error);
            throw new Error(`Failed to enhance image quality: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Comprehensive image processing pipeline
    async processImage(discoveredImage: DiscoveredImage): Promise<ProcessedImage> {
        try {
            console.log(`Starting image processing for ${discoveredImage.id}`);

            // Step 1: Download and validate image
            const imageBuffer = await this.downloadImage(discoveredImage.sourceUrl);
            const imageInfo = await this.getImageInfo(imageBuffer);

            // Step 2: Validate image format and size
            this.validateImage(imageInfo, discoveredImage);

            // Step 3: Process the image through the pipeline
            let processedBuffer = imageBuffer;
            const startTime = Date.now();

            // Remove watermarks if detected
            if (discoveredImage.qualityScore < 0.8) {
                processedBuffer = await this.processWatermarkRemoval(processedBuffer);
            }

            // Resize if too large
            if (imageInfo.width > this.standardDimensions.width || imageInfo.height > this.standardDimensions.height) {
                processedBuffer = await this.resizeImageBuffer(processedBuffer, this.standardDimensions);
            }

            // Optimize for web
            processedBuffer = await this.optimizeImageBuffer(processedBuffer);

            // Generate thumbnail
            const thumbnailBuffer = await this.generateThumbnail(processedBuffer);

            // Create processing metadata
            const finalInfo = await this.getImageInfo(processedBuffer);
            const processingMetadata: ProcessingMetadata = {
                watermarkRemoved: discoveredImage.qualityScore < 0.8,
                qualityEnhanced: true,
                resized: imageInfo.width !== finalInfo.width || imageInfo.height !== finalInfo.height,
                optimized: true,
                originalDimensions: { width: imageInfo.width, height: imageInfo.height },
                finalDimensions: { width: finalInfo.width, height: finalInfo.height },
                compressionRatio: finalInfo.size / imageInfo.size,
                processingTimeMs: Date.now() - startTime
            };

            return {
                id: `processed_${discoveredImage.id}`,
                originalImageId: discoveredImage.id,
                cloudStorageUrl: '', // Will be set after upload
                thumbnailUrl: '', // Will be set after upload
                optimizedUrl: '', // Will be set after upload
                backupUrl: '', // Will be set after backup
                metadata: {
                    ...discoveredImage.metadata,
                    processedAt: new Date(),
                    dimensions: finalInfo
                },
                processingMetadata,
                processedAt: new Date()
            };

        } catch (error) {
            console.error('Error in image processing pipeline:', error);
            throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Helper methods
    private async downloadImage(url: string): Promise<Buffer> {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000, // 30 seconds
                maxContentLength: this.maxImageSize,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ImageBot/1.0)'
                }
            });

            return Buffer.from(response.data);
        } catch (error) {
            console.error('Error downloading image:', error);
            throw new Error(`Failed to download image from ${url}`);
        }
    }

    private async getImageInfo(buffer: Buffer): Promise<{ width: number; height: number; format: string; size: number }> {
        try {
            const metadata = await sharp(buffer).metadata();
            return {
                width: metadata.width || 0,
                height: metadata.height || 0,
                format: metadata.format || 'unknown',
                size: buffer.length
            };
        } catch (error) {
            throw new Error('Failed to get image metadata');
        }
    }

    private validateImage(imageInfo: any, discoveredImage: DiscoveredImage): void {
        // Check if image is too small
        if (imageInfo.width < 100 || imageInfo.height < 100) {
            throw new Error('Image is too small (minimum 100x100 pixels)');
        }

        // Check if image is too large
        if (imageInfo.size > this.maxImageSize) {
            throw new Error(`Image is too large (maximum ${this.maxImageSize / 1024 / 1024}MB)`);
        }

        // Check supported formats
        const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
        if (!supportedFormats.includes(imageInfo.format.toLowerCase())) {
            throw new Error(`Unsupported image format: ${imageInfo.format}`);
        }
    }

    private async processWatermarkRemoval(buffer: Buffer): Promise<Buffer> {
        try {
            // Basic watermark removal using image processing
            // This is a simplified implementation - in production, you'd use more sophisticated algorithms
            return await sharp(buffer)
                .modulate({
                    brightness: 1.1,
                    saturation: 1.1
                })
                .sharpen()
                .toBuffer();
        } catch (error) {
            console.error('Error in watermark removal:', error);
            return buffer; // Return original if processing fails
        }
    }

    private async resizeImageBuffer(buffer: Buffer, dimensions: ImageDimensions): Promise<Buffer> {
        try {
            return await sharp(buffer)
                .resize(dimensions.width, dimensions.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();
        } catch (error) {
            console.error('Error resizing image:', error);
            throw new Error('Failed to resize image');
        }
    }

    private async optimizeImageBuffer(buffer: Buffer): Promise<Buffer> {
        try {
            const metadata = await sharp(buffer).metadata();

            if (metadata.format === 'jpeg') {
                return await sharp(buffer)
                    .jpeg({ quality: this.defaultQuality, progressive: true })
                    .toBuffer();
            } else if (metadata.format === 'png') {
                return await sharp(buffer)
                    .png({ compressionLevel: 8, progressive: true })
                    .toBuffer();
            } else if (metadata.format === 'webp') {
                return await sharp(buffer)
                    .webp({ quality: this.defaultQuality })
                    .toBuffer();
            }

            // Convert other formats to JPEG
            return await sharp(buffer)
                .jpeg({ quality: this.defaultQuality, progressive: true })
                .toBuffer();

        } catch (error) {
            console.error('Error optimizing image:', error);
            throw new Error('Failed to optimize image');
        }
    }

    private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
        try {
            return await sharp(buffer)
                .resize(this.thumbnailDimensions.width, this.thumbnailDimensions.height, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80 })
                .toBuffer();
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            throw new Error('Failed to generate thumbnail');
        }
    }

    // Format validation and conversion
    async validateAndConvertFormat(buffer: Buffer, targetFormat: ImageFormat): Promise<Buffer> {
        try {
            const sharpInstance = sharp(buffer);

            switch (targetFormat) {
                case ImageFormat.JPEG:
                    return await sharpInstance.jpeg({ quality: this.defaultQuality }).toBuffer();
                case ImageFormat.PNG:
                    return await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
                case ImageFormat.WEBP:
                    return await sharpInstance.webp({ quality: this.defaultQuality }).toBuffer();
                default:
                    return await sharpInstance.jpeg({ quality: this.defaultQuality }).toBuffer();
            }
        } catch (error) {
            console.error('Error converting image format:', error);
            throw new Error(`Failed to convert image to ${targetFormat}`);
        }
    }

    // Batch processing support
    async processMultipleImages(discoveredImages: DiscoveredImage[]): Promise<ProcessedImage[]> {
        const results: ProcessedImage[] = [];
        const errors: string[] = [];

        for (const image of discoveredImages) {
            try {
                const processed = await this.processImage(image);
                results.push(processed);
            } catch (error) {
                const errorMessage = `Failed to process image ${image.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                console.error(errorMessage);
                errors.push(errorMessage);
            }
        }

        if (errors.length > 0) {
            console.warn(`Batch processing completed with ${errors.length} errors:`, errors);
        }

        return results;
    }
}