// Core types for automated image management system

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ImageMetadata {
    sourceUrl: string;
    fileName: string;
    fileSize: number;
    format: ImageFormat;
    dimensions: ImageDimensions;
    contentType: string;
    uploadedAt: Date;
    processedAt?: Date;
}

export interface DiscoveredImage {
    id: string;
    sourceUrl: string;
    thumbnailUrl: string;
    dimensions: ImageDimensions;
    fileSize: number;
    format: ImageFormat;
    relevanceScore: number;
    qualityScore: number;
    metadata: ImageMetadata;
    discoveredAt: Date;
}

export interface ProcessedImage {
    id: string;
    originalImageId: string;
    cloudStorageUrl: string;
    thumbnailUrl: string;
    optimizedUrl: string;
    backupUrl: string;
    metadata: ImageMetadata;
    processingMetadata: ProcessingMetadata;
    processedAt: Date;
}

export interface ProcessingMetadata {
    watermarkRemoved: boolean;
    qualityEnhanced: boolean;
    resized: boolean;
    optimized: boolean;
    originalDimensions: ImageDimensions;
    finalDimensions: ImageDimensions;
    compressionRatio: number;
    processingTimeMs: number;
}

export interface ApprovedImage {
    discoveredImageId: string;
    productId: string;
    approvedBy: string;
    approvedAt: Date;
    isPrimary: boolean;
    displayOrder: number;
}

export interface ProcessingStatus {
    productId: string;
    stage: ProcessingStage;
    status: ProcessingStatusType;
    discoveredImages: DiscoveredImage[];
    approvedImages: ApprovedImage[];
    processedImages: ProcessedImage[];
    errors: ProcessingError[];
    timestamps: ProcessingTimestamps;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProcessingError {
    stage: ProcessingStage;
    errorType: string;
    message: string;
    details?: any;
    timestamp: Date;
    retryCount: number;
}

export interface ProcessingTimestamps {
    discoveryStarted?: Date;
    discoveryCompleted?: Date;
    approvalPending?: Date;
    processingStarted?: Date;
    processingCompleted?: Date;
    storageCompleted?: Date;
}

export interface ProductIdentifier {
    productName: string;
    displayName?: string;
    printName?: string;
    category?: string;
    brand?: string;
}

export interface ImageUrls {
    original: string;
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
}

export interface StorageResult {
    publicId: string;
    secureUrl: string;
    urls: ImageUrls;
    metadata: {
        width: number;
        height: number;
        format: string;
        bytes: number;
    };
}

export interface BackupResult {
    backupId: string;
    backupUrl: string;
    createdAt: Date;
}

export interface QualityScore {
    overall: number;
    sharpness: number;
    brightness: number;
    contrast: number;
    colorfulness: number;
    hasWatermark: boolean;
}

// Enums
export enum ImageFormat {
    JPEG = 'jpeg',
    PNG = 'png',
    WEBP = 'webp',
    GIF = 'gif',
    SVG = 'svg'
}

export enum ProcessingStage {
    DISCOVERY = 'discovery',
    APPROVAL_PENDING = 'approval_pending',
    PROCESSING = 'processing',
    STORAGE = 'storage',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum ProcessingStatusType {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

// Service interfaces
export interface ImageDiscoveryService {
    searchImages(productIdentifiers: ProductIdentifier[]): Promise<DiscoveredImage[]>;
    validateImageQuality(image: DiscoveredImage): Promise<QualityScore>;
    rankImagesByRelevance(images: DiscoveredImage[], product: ProductIdentifier): DiscoveredImage[];
}

export interface ImageProcessingService {
    removeWatermarks(image: DiscoveredImage): Promise<ProcessedImage>;
    optimizeImage(image: ProcessedImage): Promise<ProcessedImage>;
    resizeImage(image: ProcessedImage, dimensions: ImageDimensions): Promise<ProcessedImage>;
    enhanceQuality(image: ProcessedImage): Promise<ProcessedImage>;
}

export interface CloudStorageService {
    uploadImage(image: ProcessedImage, metadata: ImageMetadata): Promise<StorageResult>;
    generateOptimizedUrls(storageResult: StorageResult): Promise<ImageUrls>;
    deleteImage(imageId: string): Promise<boolean>;
    createBackup(originalImage: DiscoveredImage): Promise<BackupResult>;
}

export interface ImageManagementService {
    processProductImages(productId: string): Promise<ProcessingStatus>;
    getProcessingStatus(productId: string): Promise<ProcessingStatus | null>;
    retryFailedProcessing(productId: string): Promise<ProcessingStatus>;
    cleanupTemporaryImages(productId: string): Promise<void>;
}