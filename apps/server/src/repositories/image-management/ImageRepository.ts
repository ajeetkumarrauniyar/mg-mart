import { db } from '../../services/firebase.js';
import { ProductImage, ImageProcessingJob } from '../../models/ProductImage.js';
import { ProcessingStatus, ProcessingStatusType, ProcessingStage } from '../../types/image-management/index.js';

export class ImageRepository {
    private readonly productImagesCollection = 'productImages';
    private readonly imageProcessingJobsCollection = 'imageProcessingJobs';

    // Product Images CRUD operations
    async createProductImage(productImage: ProductImage): Promise<string> {
        try {
            const validation = productImage.validate();
            if (!validation.isValid) {
                throw new Error(`Invalid product image: ${validation.errors.join(', ')}`);
            }

            const docRef = await db.collection(this.productImagesCollection).add(productImage.toFirestoreDocument());
            return docRef.id;
        } catch (error) {
            console.error('Error creating product image:', error);
            throw new Error(`Failed to create product image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getProductImageById(imageId: string): Promise<ProductImage | null> {
        try {
            const doc = await db.collection(this.productImagesCollection).doc(imageId).get();

            if (!doc.exists) {
                return null;
            }

            return ProductImage.fromFirestoreDocument(doc.id, doc.data());
        } catch (error) {
            console.error('Error getting product image by ID:', error);
            throw new Error(`Failed to get product image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getProductImagesByProductId(productId: string): Promise<ProductImage[]> {
        try {
            const snapshot = await db.collection(this.productImagesCollection)
                .where('productId', '==', productId)
                .orderBy('displayOrder', 'asc')
                .get();

            return snapshot.docs.map((doc: any) => ProductImage.fromFirestoreDocument(doc.id, doc.data()));
        } catch (error) {
            console.error('Error getting product images by product ID:', error);
            throw new Error(`Failed to get product images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateProductImage(imageId: string, updates: Partial<ProductImage>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            await db.collection(this.productImagesCollection).doc(imageId).update(updateData);
        } catch (error) {
            console.error('Error updating product image:', error);
            throw new Error(`Failed to update product image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteProductImage(imageId: string): Promise<void> {
        try {
            await db.collection(this.productImagesCollection).doc(imageId).delete();
        } catch (error) {
            console.error('Error deleting product image:', error);
            throw new Error(`Failed to delete product image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async setPrimaryImage(productId: string, imageId: string): Promise<void> {
        try {
            const batch = db.batch();

            // First, set all images for this product to non-primary
            const existingImages = await this.getProductImagesByProductId(productId);
            existingImages.forEach(image => {
                const docRef = db.collection(this.productImagesCollection).doc(image.id);
                batch.update(docRef, { isPrimary: false, updatedAt: new Date() });
            });

            // Then set the specified image as primary
            const primaryImageRef = db.collection(this.productImagesCollection).doc(imageId);
            batch.update(primaryImageRef, { isPrimary: true, updatedAt: new Date() });

            await batch.commit();
        } catch (error) {
            console.error('Error setting primary image:', error);
            throw new Error(`Failed to set primary image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Image Processing Jobs CRUD operations
    async createProcessingJob(job: ImageProcessingJob): Promise<string> {
        try {
            const validation = job.validate();
            if (!validation.isValid) {
                throw new Error(`Invalid processing job: ${validation.errors.join(', ')}`);
            }

            const docRef = await db.collection(this.imageProcessingJobsCollection).add(job.toFirestoreDocument());
            return docRef.id;
        } catch (error) {
            console.error('Error creating processing job:', error);
            throw new Error(`Failed to create processing job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getProcessingJobById(jobId: string): Promise<ImageProcessingJob | null> {
        try {
            const doc = await db.collection(this.imageProcessingJobsCollection).doc(jobId).get();

            if (!doc.exists) {
                return null;
            }

            return ImageProcessingJob.fromFirestoreDocument(doc.id, doc.data());
        } catch (error) {
            console.error('Error getting processing job by ID:', error);
            throw new Error(`Failed to get processing job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getProcessingJobByProductId(productId: string): Promise<ImageProcessingJob | null> {
        try {
            const snapshot = await db.collection(this.imageProcessingJobsCollection)
                .where('productId', '==', productId)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            if (!doc) {
                return null;
            }
            return ImageProcessingJob.fromFirestoreDocument(doc.id, doc.data());
        } catch (error) {
            console.error('Error getting processing job by product ID:', error);
            throw new Error(`Failed to get processing job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateProcessingJob(jobId: string, updates: Partial<ImageProcessingJob>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            await db.collection(this.imageProcessingJobsCollection).doc(jobId).update(updateData);
        } catch (error) {
            console.error('Error updating processing job:', error);
            throw new Error(`Failed to update processing job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateProcessingJobStatus(jobId: string, status: ProcessingStatusType, stage: ProcessingStage): Promise<void> {
        try {
            await this.updateProcessingJob(jobId, {
                status,
                stage,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating processing job status:', error);
            throw new Error(`Failed to update processing job status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteProcessingJob(jobId: string): Promise<void> {
        try {
            await db.collection(this.imageProcessingJobsCollection).doc(jobId).delete();
        } catch (error) {
            console.error('Error deleting processing job:', error);
            throw new Error(`Failed to delete processing job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Utility methods
    async getProcessingJobsByStatus(status: ProcessingStatusType): Promise<ImageProcessingJob[]> {
        try {
            const snapshot = await db.collection(this.imageProcessingJobsCollection)
                .where('status', '==', status)
                .orderBy('createdAt', 'asc')
                .get();

            return snapshot.docs.map((doc: any) => ImageProcessingJob.fromFirestoreDocument(doc.id, doc.data()));
        } catch (error) {
            console.error('Error getting processing jobs by status:', error);
            throw new Error(`Failed to get processing jobs by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async cleanupOldProcessingJobs(olderThanDays: number = 7): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            const snapshot = await db.collection(this.imageProcessingJobsCollection)
                .where('createdAt', '<', cutoffDate)
                .where('status', 'in', [ProcessingStatusType.COMPLETED, ProcessingStatusType.FAILED])
                .get();

            const batch = db.batch();
            snapshot.docs.forEach((doc: any) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            return snapshot.size;
        } catch (error) {
            console.error('Error cleaning up old processing jobs:', error);
            throw new Error(`Failed to cleanup old processing jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}