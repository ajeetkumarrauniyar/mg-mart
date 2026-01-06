const admin = require('firebase-admin');
const path = require('path');

// Enhanced logging
const log = {
    info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
    success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
    warn: (msg) => console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`),
    error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`)
};

let db = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
    try {
        // Check if already initialized
        if (admin.apps.length > 0) {
            db = admin.firestore();
            return db;
        }

        // Look for service account key file
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
        
        if (!require('fs').existsSync(serviceAccountPath)) {
            log.warn("Firebase service account key not found!");
            log.info("Please add 'firebase-service-account.json' to this directory");
            log.info("Download it from: Firebase Console > Project Settings > Service Accounts");
            return null;
        }

        // Initialize Firebase Admin
        const serviceAccount = require(serviceAccountPath);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // Add your Firebase project ID here if needed
            // projectId: 'your-project-id'
        });

        db = admin.firestore();
        log.success("Firebase Admin SDK initialized successfully");
        return db;

    } catch (error) {
        log.error(`Firebase initialization failed: ${error.message}`);
        return null;
    }
}

/**
 * Get Firestore database instance
 */
function getFirestore() {
    if (!db) {
        return initializeFirebase();
    }
    return db;
}

/**
 * Upload products to Firestore in batches
 */
async function uploadProductsToFirestore(products, options = {}) {
    const {
        batchSize = 500,
        collection = 'products',
        merge = true,
        dryRun = false
    } = options;

    const firestore = getFirestore();
    if (!firestore) {
        throw new Error("Firebase not initialized");
    }

    log.info(`🔥 Starting Firebase upload of ${products.length} products...`);
    
    if (dryRun) {
        log.warn("DRY RUN MODE - No actual data will be uploaded");
    }

    // Split products into batches
    const batches = [];
    for (let i = 0; i < products.length; i += batchSize) {
        batches.push(products.slice(i, i + batchSize));
    }

    log.info(`📦 Created ${batches.length} batches (max ${batchSize} items each)`);

    const results = {
        totalProducts: products.length,
        totalBatches: batches.length,
        successfulBatches: 0,
        failedBatches: 0,
        errors: []
    };

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchNumber = batchIndex + 1;
        
        try {
            log.info(`📤 Processing batch ${batchNumber}/${batches.length} (${batch.length} products)...`);
            
            if (!dryRun) {
                // Create Firestore batch
                const firestoreBatch = firestore.batch();
                
                // Add each product to the batch
                batch.forEach(product => {
                    const docRef = firestore.collection(collection).doc(product.productId);
                    
                    if (merge) {
                        // Merge to preserve existing fields like imageUrl, description
                        firestoreBatch.set(docRef, product, { merge: true });
                    } else {
                        // Overwrite completely
                        firestoreBatch.set(docRef, product);
                    }
                });
                
                // Commit the batch
                await firestoreBatch.commit();
            }
            
            results.successfulBatches++;
            log.success(`✅ Batch ${batchNumber} uploaded successfully (${batch.length} products)`);
            
            // Small delay between batches to avoid rate limits
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
        } catch (error) {
            results.failedBatches++;
            results.errors.push({
                batch: batchNumber,
                error: error.message,
                products: batch.length
            });
            
            log.error(`❌ Batch ${batchNumber} failed: ${error.message}`);
        }
    }

    // Summary
    log.info('\n' + '='.repeat(60));
    log.info('🎯 FIREBASE UPLOAD SUMMARY');
    log.info('='.repeat(60));
    log.info(`📊 Total Products: ${results.totalProducts}`);
    log.info(`📦 Total Batches: ${results.totalBatches}`);
    log.success(`✅ Successful Batches: ${results.successfulBatches}`);
    
    if (results.failedBatches > 0) {
        log.error(`❌ Failed Batches: ${results.failedBatches}`);
        results.errors.forEach(error => {
            log.error(`   Batch ${error.batch}: ${error.error} (${error.products} products)`);
        });
    }
    
    const successRate = ((results.successfulBatches / results.totalBatches) * 100).toFixed(1);
    log.info(`📈 Success Rate: ${successRate}%`);
    
    if (results.successfulBatches === results.totalBatches) {
        log.success('🎉 All products uploaded successfully!');
    }

    return results;
}

/**
 * Test Firebase connection
 */
async function testFirebaseConnection() {
    try {
        const firestore = getFirestore();
        if (!firestore) {
            return false;
        }

        // Try to read from a test collection
        const testRef = firestore.collection('_test').doc('connection');
        await testRef.set({ 
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            test: true 
        });
        
        await testRef.delete(); // Clean up
        
        log.success("Firebase connection test passed");
        return true;
        
    } catch (error) {
        log.error(`Firebase connection test failed: ${error.message}`);
        return false;
    }
}

/**
 * Get product count from Firestore
 */
async function getProductCount(collection = 'products') {
    try {
        const firestore = getFirestore();
        if (!firestore) {
            return 0;
        }

        const snapshot = await firestore.collection(collection).count().get();
        return snapshot.data().count;
        
    } catch (error) {
        log.error(`Failed to get product count: ${error.message}`);
        return 0;
    }
}

module.exports = {
    initializeFirebase,
    getFirestore,
    uploadProductsToFirestore,
    testFirebaseConnection,
    getProductCount
}