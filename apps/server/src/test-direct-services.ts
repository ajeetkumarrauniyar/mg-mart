/**
 * Direct test of image management services
 * This bypasses the API layer to test services directly
 */

import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

async function testDirectServices() {
    console.log('🧪 Testing Image Management Services Directly...\n');

    try {
        // Test 1: Environment Variables
        console.log('1. 📋 Environment Variables:');
        console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not set'}`);
        console.log(`   GOOGLE_CUSTOM_SEARCH_API_KEY: ${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY ? 'Set' : 'Not set'}`);

        // Test 2: Import and test services
        console.log('\n2. 🔧 Testing Service Imports...');

        // Import services after environment variables are loaded
        const { CloudStorageService } = await import('./services/image-management/CloudStorageService.js');
        const { ImageDiscoveryService } = await import('./services/image-management/ImageDiscoveryService.js');
        const { ImageManagementService } = await import('./services/image-management/ImageManagementService.js');

        console.log('   ✅ Services imported successfully');

        // Test 3: Create service instances
        console.log('\n3. 🏗️ Creating Service Instances...');
        const storageService = new CloudStorageService();
        const discoveryService = new ImageDiscoveryService();
        const managementService = new ImageManagementService();
        console.log('   ✅ Service instances created');

        // Test 4: Test Cloudinary Health
        console.log('\n4. ☁️ Testing Cloudinary Health...');
        const storageHealth = await storageService.healthCheck();
        console.log(`   Status: ${storageHealth.status}`);
        console.log(`   Message: ${storageHealth.message}`);

        // Test 5: Test Image Discovery
        console.log('\n5. 🔍 Testing Image Discovery...');
        const testProduct = {
            productName: 'Apple iPhone 15',
            displayName: 'iPhone 15 Pro',
            category: 'electronics',
            brand: 'Apple'
        };

        const discoveredImages = await discoveryService.searchImages([testProduct]);
        console.log(`   Found ${discoveredImages.length} images`);

        if (discoveredImages.length > 0) {
            console.log(`   First image: ${discoveredImages[0].sourceUrl.substring(0, 80)}...`);
            console.log(`   Quality score: ${discoveredImages[0].qualityScore}`);
        }

        // Test 6: Test Management Service Health
        console.log('\n6. 🏥 Testing Management Service Health...');
        const managementHealth = await managementService.healthCheck();
        console.log(`   Status: ${managementHealth.status}`);
        console.log('   Services:', JSON.stringify(managementHealth.services, null, 4));

        console.log('\n🎉 Direct service testing completed successfully!');

    } catch (error) {
        console.error('❌ Direct service test failed:', error);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testDirectServices()
        .then(() => {
            console.log('\n✨ Direct service test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Direct service test failed:', error);
            process.exit(1);
        });
}