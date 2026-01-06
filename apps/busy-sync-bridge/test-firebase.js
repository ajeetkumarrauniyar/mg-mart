const { testConnection, getSampleData, getProductsWithPrices, uploadToFirebase } = require('./working-sync');
const { checkFirebaseSetup } = require('./firebase-setup');

// Enhanced logging
const log = {
    info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
    success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
    warn: (msg) => console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`),
    error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`)
};

/**
 * Test Firebase integration with a small sample
 */
async function testFirebaseIntegration() {
    try {
        log.info("🧪 Testing Firebase Integration (DRY RUN)");
        log.info("=".repeat(50));
        
        // Check Firebase setup
        const setupOk = await checkFirebaseSetup();
        if (!setupOk) {
            log.error("❌ Firebase setup incomplete. Run 'node firebase-setup.js' first.");
            return;
        }
        
        log.info("");
        log.info("📊 Testing with sample data...");
        
        // Create sample products for testing
        const sampleProducts = [
            {
                productId: "TEST_001",
                name: "Test Product 1",
                barcode: "",
                price: 100,
                mrp: 100,
                category: "Household",
                unit: "piece",
                inStock: true,
                lastUpdated: new Date().toISOString(),
                source: "BUSY_ERP_TEST"
            },
            {
                productId: "TEST_002", 
                name: "Test Product 2",
                barcode: "",
                price: 200,
                mrp: 200,
                category: "Personal Care",
                unit: "piece",
                inStock: true,
                lastUpdated: new Date().toISOString(),
                source: "BUSY_ERP_TEST"
            }
        ];
        
        log.info(`🔬 Testing upload of ${sampleProducts.length} sample products...`);
        
        // Test with dry run first
        log.info("🏃 DRY RUN - No actual data will be uploaded");
        const dryRunSuccess = await uploadToFirebase(sampleProducts, { dryRun: true });
        
        if (dryRunSuccess) {
            log.success("✅ Dry run completed successfully!");
            log.info("");
            log.info("🎯 READY FOR PRODUCTION!");
            log.info("To upload real data from BUSY:");
            log.info("1. Run: npm start");
            log.info("2. This will sync all 1405 products to Firebase");
            log.info("3. Products will appear in your admin panel");
        } else {
            log.error("❌ Dry run failed. Check Firebase configuration.");
        }
        
    } catch (error) {
        log.error(`Test failed: ${error.message}`);
    }
}

/**
 * Test with actual BUSY data (small sample)
 */
async function testWithBusyData() {
    try {
        log.info("🧪 Testing with Real BUSY Data (5 products)");
        log.info("=".repeat(50));
        
        // Check Firebase setup
        const setupOk = await checkFirebaseSetup();
        if (!setupOk) {
            log.error("❌ Firebase setup incomplete. Run 'node firebase-setup.js' first.");
            return;
        }
        
        // Test BUSY connection
        const totalProducts = await testConnection();
        if (!totalProducts) {
            log.error("❌ BUSY database connection failed");
            return;
        }
        
        // Get sample data
        log.info("📝 Getting sample data from BUSY...");
        await getSampleData();
        
        log.info("🔬 This would upload sample products to Firebase");
        log.info("⚠️  Run 'npm start' to perform full sync of all 1405 products");
        
    } catch (error) {
        log.error(`BUSY test failed: ${error.message}`);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--busy')) {
        await testWithBusyData();
    } else {
        await testFirebaseIntegration();
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { testFirebaseIntegration, testWithBusyData };