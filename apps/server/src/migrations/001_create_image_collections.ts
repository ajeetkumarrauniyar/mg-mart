import { db } from '../services/firebase.js';

/**
 * Migration script to create Firestore collections and indexes for image management
 * This script sets up the necessary collections and composite indexes
 */

export async function createImageCollections() {
    console.log('Starting image collections migration...');

    try {
        // Create productImages collection with sample document (will be deleted)
        const productImagesRef = db.collection('productImages');
        const sampleProductImage = await productImagesRef.add({
            productId: 'sample',
            cloudStorageUrl: 'https://example.com/sample.jpg',
            thumbnailUrl: 'https://example.com/sample_thumb.jpg',
            originalSourceUrl: 'https://example.com/original.jpg',
            displayOrder: 0,
            isPrimary: true,
            processingMetadata: {},
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create imageProcessingJobs collection with sample document (will be deleted)
        const processingJobsRef = db.collection('imageProcessingJobs');
        const sampleJob = await processingJobsRef.add({
            productId: 'sample',
            status: 'completed',
            stage: 'completed',
            discoveredImages: [],
            approvedImages: [],
            processedImages: [],
            errorLog: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Collections created successfully');

        // Clean up sample documents
        await sampleProductImage.delete();
        await sampleJob.delete();

        console.log('Sample documents cleaned up');

        // Note: Composite indexes need to be created manually in Firebase Console
        console.log(`
    IMPORTANT: Please create the following composite indexes in Firebase Console:
    
    Collection: productImages
    - Fields: productId (Ascending), displayOrder (Ascending)
    
    Collection: imageProcessingJobs  
    - Fields: productId (Ascending), createdAt (Descending)
    - Fields: status (Ascending), createdAt (Ascending)
    - Fields: createdAt (Ascending), status (Array-contains-any)
    
    Visit: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
    `);

        console.log('Image collections migration completed successfully');
        return true;

    } catch (error) {
        console.error('Error during image collections migration:', error);
        throw error;
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createImageCollections()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}