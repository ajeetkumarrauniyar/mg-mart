import {
    ProcessingStatus,
    ProcessedImage,
    ImageMetadata,
    ProcessingStage,
    ProcessingStatusType
} from '../types/image-management/index.js';

export class ProductImage {
    constructor(
        public id: string,
        public productId: string,
        public cloudStorageUrl: string,
        public thumbnailUrl: string,
        public originalSourceUrl: string,
        public displayOrder: number = 0,
        public isPrimary: boolean = false,
        public processingMetadata: any = {},
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static fromProcessedImage(processedImage: ProcessedImage, productId: string): ProductImage {
        return new ProductImage(
            processedImage.id,
            productId,
            processedImage.cloudStorageUrl,
            processedImage.thumbnailUrl,
            processedImage.metadata.sourceUrl,
            0,
            false,
            processedImage.processingMetadata,
            new Date(),
            new Date()
        );
    }

    toFirestoreDocument() {
        return {
            productId: this.productId,
            cloudStorageUrl: this.cloudStorageUrl,
            thumbnailUrl: this.thumbnailUrl,
            originalSourceUrl: this.originalSourceUrl,
            displayOrder: this.displayOrder,
            isPrimary: this.isPrimary,
            processingMetadata: this.processingMetadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromFirestoreDocument(id: string, data: any): ProductImage {
        return new ProductImage(
            id,
            data.productId,
            data.cloudStorageUrl,
            data.thumbnailUrl,
            data.originalSourceUrl,
            data.displayOrder || 0,
            data.isPrimary || false,
            data.processingMetadata || {},
            data.createdAt?.toDate() || new Date(),
            data.updatedAt?.toDate() || new Date()
        );
    }

    validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.id || this.id.trim() === '') {
            errors.push('ID is required');
        }

        if (!this.productId || this.productId.trim() === '') {
            errors.push('Product ID is required');
        }

        if (!this.cloudStorageUrl || this.cloudStorageUrl.trim() === '') {
            errors.push('Cloud storage URL is required');
        }

        if (!this.thumbnailUrl || this.thumbnailUrl.trim() === '') {
            errors.push('Thumbnail URL is required');
        }

        if (!this.originalSourceUrl || this.originalSourceUrl.trim() === '') {
            errors.push('Original source URL is required');
        }

        if (this.displayOrder < 0) {
            errors.push('Display order must be non-negative');
        }

        // Validate URLs
        try {
            new URL(this.cloudStorageUrl);
        } catch {
            errors.push('Invalid cloud storage URL format');
        }

        try {
            new URL(this.thumbnailUrl);
        } catch {
            errors.push('Invalid thumbnail URL format');
        }

        try {
            new URL(this.originalSourceUrl);
        } catch {
            errors.push('Invalid original source URL format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export class ImageProcessingJob {
    constructor(
        public id: string,
        public productId: string,
        public status: ProcessingStatusType,
        public stage: ProcessingStage,
        public discoveredImages: any[] = [],
        public approvedImages: any[] = [],
        public processedImages: any[] = [],
        public errorLog: any[] = [],
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static fromProcessingStatus(processingStatus: ProcessingStatus): ImageProcessingJob {
        return new ImageProcessingJob(
            `job_${processingStatus.productId}_${Date.now()}`,
            processingStatus.productId,
            processingStatus.status,
            processingStatus.stage,
            processingStatus.discoveredImages,
            processingStatus.approvedImages,
            processingStatus.processedImages,
            processingStatus.errors,
            processingStatus.createdAt,
            processingStatus.updatedAt
        );
    }

    toFirestoreDocument() {
        return {
            productId: this.productId,
            status: this.status,
            stage: this.stage,
            discoveredImages: this.discoveredImages,
            approvedImages: this.approvedImages,
            processedImages: this.processedImages,
            errorLog: this.errorLog,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromFirestoreDocument(id: string, data: any): ImageProcessingJob {
        return new ImageProcessingJob(
            id,
            data.productId,
            data.status,
            data.stage,
            data.discoveredImages || [],
            data.approvedImages || [],
            data.processedImages || [],
            data.errorLog || [],
            data.createdAt?.toDate() || new Date(),
            data.updatedAt?.toDate() || new Date()
        );
    }

    updateStatus(status: ProcessingStatusType, stage: ProcessingStage) {
        this.status = status;
        this.stage = stage;
        this.updatedAt = new Date();
    }

    addError(error: any) {
        this.errorLog.push({
            ...error,
            timestamp: new Date()
        });
        this.updatedAt = new Date();
    }

    validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.id || this.id.trim() === '') {
            errors.push('Job ID is required');
        }

        if (!this.productId || this.productId.trim() === '') {
            errors.push('Product ID is required');
        }

        if (!Object.values(ProcessingStatusType).includes(this.status)) {
            errors.push('Invalid processing status');
        }

        if (!Object.values(ProcessingStage).includes(this.stage)) {
            errors.push('Invalid processing stage');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}