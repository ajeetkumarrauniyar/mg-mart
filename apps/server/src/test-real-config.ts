/**
 * Test script for real configuration setup
 * This script tests each service individually to help with setup
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

async function testRealConfiguration() {
    console.log('🔧 Testing Real Configuration Setup...\n');

    // Test 1: Environment Variables
    console.log('1. 📋 Checking Environment Variables...');
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'GOOGLE_CUSTOM_SEARCH_API_KEY',
        'GOOGLE_CUSTOM_SEARCH_ENGINE_ID'
    ];

    const missingVars: string[] = [];
    const presentVars: string[] = [];

    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            presentVars.push(varName);
            console.log(`   ✅ ${varName}: Set`);
        } else {
            missingVars.push(varName);
            console.log(`   ❌ ${varName}: Missing`);
        }
    });

    console.log(`\n   Summary: ${presentVars.length}/${requiredEnvVars.length} variables configured`);

    // Test 2: Firebase Service Account
    console.log('\n2. 🔥 Checking Firebase Configuration...');
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            console.log('   ✅ Service account key loaded from environment');
            console.log(`   📋 Project ID: ${serviceAccount.project_id}`);
        } else {
            // Try to load from file
            const keyPath = join(process.cwd(), 'firebase-service-account.json');
            try {
                const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
                console.log('   ✅ Service account key loaded from file');
                console.log(`   📋 Project ID: ${serviceAccount.project_id}`);
            } catch (fileError) {
                console.log('   ❌ No service account key found (environment or file)');
                console.log('   💡 Create firebase-service-account.json or set FIREBASE_SERVICE_ACCOUNT_KEY');
            }
        }
    } catch (error) {
        console.log('   ❌ Invalid service account key format');
    }

    // Test 3: Cloudinary Configuration
    console.log('\n3. ☁️ Testing Cloudinary Connection...');
    try {
        const { CloudStorageService } = await import('./services/image-management/CloudStorageService.js');
        const storageService = new CloudStorageService();
        const health = await storageService.healthCheck();

        if (health.status === 'healthy') {
            console.log('   ✅ Cloudinary connection successful');

            // Test storage usage
            try {
                const usage = await storageService.getStorageUsage();
                console.log(`   📊 Storage used: ${(usage.used / 1024 / 1024).toFixed(2)} MB`);
                console.log(`   📊 Storage limit: ${(usage.limit / 1024 / 1024).toFixed(2)} MB`);
            } catch (usageError) {
                console.log('   ⚠️  Could not get storage usage (but connection works)');
            }
        } else {
            console.log(`   ❌ Cloudinary connection failed: ${health.message}`);
        }
    } catch (error) {
        console.log(`   ❌ Cloudinary test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Image Discovery APIs
    console.log('\n4. 🔍 Testing Image Discovery APIs...');
    try {
        const { ImageDiscoveryService } = await import('./services/image-management/ImageDiscoveryService.js');
        const discoveryService = new ImageDiscoveryService();

        const testProduct = {
            productName: 'Apple iPhone 15',
            displayName: 'iPhone 15 Pro',
            category: 'electronics',
            brand: 'Apple'
        };

        console.log('   🔍 Searching for images...');
        const discoveredImages = await discoveryService.searchImages([testProduct]);

        if (discoveredImages.length > 0) {
            console.log(`   ✅ Found ${discoveredImages.length} images`);
            console.log(`   📋 First image: ${discoveredImages[0].sourceUrl}`);
            console.log(`   📊 Quality score: ${discoveredImages[0].qualityScore}`);
            console.log(`   📊 Relevance score: ${discoveredImages[0].relevanceScore}`);
        } else {
            console.log('   ⚠️  No images found (check API keys and quotas)');
        }
    } catch (error) {
        console.log(`   ❌ Image discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Firebase Connection (if configured)
    console.log('\n5. 🔥 Testing Firebase Connection...');
    if (process.env.FIREBASE_PROJECT_ID && (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || readFileSync)) {
        try {
            // Re-enable Firebase initialization for testing
            const { initializeFirebase } = await import('./services/firebase.js');
            const db = initializeFirebase();

            // Test basic Firestore operation
            const testDoc = await db.collection('test').doc('connection-test').set({
                timestamp: new Date(),
                test: 'connection'
            });

            console.log('   ✅ Firebase connection successful');
            console.log('   ✅ Firestore write test passed');

            // Clean up test document
            await db.collection('test').doc('connection-test').delete();

        } catch (error) {
            console.log(`   ❌ Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    } else {
        console.log('   ⚠️  Firebase not configured (skipping test)');
    }

    // Test 6: Complete Workflow Test (if all services available)
    console.log('\n6. 🔄 Testing Complete Workflow...');
    if (presentVars.length === requiredEnvVars.length) {
        try {
            console.log('   🚀 All services configured - testing complete workflow...');

            // This would test the complete ImageManagementService
            // But we'll skip it for now to avoid creating test data
            console.log('   ⚠️  Complete workflow test skipped (would create real data)');
            console.log('   💡 Use API endpoints to test complete workflow');

        } catch (error) {
            console.log(`   ❌ Workflow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    } else {
        console.log('   ⚠️  Not all services configured - skipping workflow test');
    }

    // Summary
    console.log('\n📊 Configuration Summary:');
    console.log(`   Environment Variables: ${presentVars.length}/${requiredEnvVars.length}`);
    console.log(`   Missing Variables: ${missingVars.join(', ') || 'None'}`);

    if (missingVars.length === 0) {
        console.log('\n🎉 All services configured! Ready for full testing.');
        console.log('\n🚀 Next Steps:');
        console.log('   1. Run database migration: pnpm run tsx src/migrations/001_create_image_collections.ts');
        console.log('   2. Start the server: pnpm run dev');
        console.log('   3. Test API endpoints with curl or Postman');
    } else {
        console.log('\n⚠️  Some services need configuration. See SETUP_GUIDE.md for details.');
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testRealConfiguration()
        .then(() => {
            console.log('\n✨ Configuration test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Configuration test failed:', error);
            process.exit(1);
        });
}