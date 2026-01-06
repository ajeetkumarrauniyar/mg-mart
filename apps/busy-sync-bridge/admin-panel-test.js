const { getFirestore, getProductCount } = require('./firebase-config');

// Enhanced logging
const log = {
    info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
    success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
    warn: (msg) => console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`),
    error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`)
};

/**
 * Test admin panel data access
 */
async function testAdminPanelAccess() {
    try {
        log.info("🔍 Testing Admin Panel Data Access");
        log.info("=".repeat(50));
        
        const firestore = getFirestore();
        if (!firestore) {
            log.error("❌ Firebase not initialized");
            return;
        }
        
        // Get product count
        const productCount = await getProductCount();
        log.info(`📊 Total products in Firestore: ${productCount}`);
        
        if (productCount === 0) {
            log.warn("⚠️  No products found. Run 'npm start' to sync from BUSY");
            return;
        }
        
        // Get sample products
        log.info("📋 Fetching sample products...");
        const productsRef = firestore.collection('products');
        const snapshot = await productsRef.limit(5).get();
        
        if (snapshot.empty) {
            log.warn("⚠️  No products found in collection");
            return;
        }
        
        log.info(`📦 Sample products (showing 5 of ${productCount}):`);
        log.info("-".repeat(50));
        
        snapshot.forEach(doc => {
            const product = doc.data();
            log.info(`🏷️  ${product.name}`);
            log.info(`   ID: ${product.productId}`);
            log.info(`   Price: ₹${product.price}`);
            log.info(`   Category: ${product.category}`);
            log.info(`   Source: ${product.source}`);
            log.info("");
        });
        
        // Test category distribution
        log.info("📊 Testing category distribution...");
        const categories = {};
        const allProductsSnapshot = await productsRef.select('category').get();
        
        allProductsSnapshot.forEach(doc => {
            const category = doc.data().category || 'Unknown';
            categories[category] = (categories[category] || 0) + 1;
        });
        
        log.info("📈 Category breakdown:");
        Object.entries(categories).forEach(([category, count]) => {
            log.info(`   ${category}: ${count} products`);
        });
        
        // Test price range
        log.info("💰 Testing price range...");
        const pricesSnapshot = await productsRef.select('price').orderBy('price').get();
        const prices = [];
        pricesSnapshot.forEach(doc => {
            const price = doc.data().price;
            if (price && price > 0) prices.push(price);
        });
        
        if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
            
            log.info(`   Min Price: ₹${minPrice}`);
            log.info(`   Max Price: ₹${maxPrice}`);
            log.info(`   Avg Price: ₹${avgPrice}`);
        }
        
        log.success("✅ Admin panel data access test completed!");
        log.info("");
        log.info("🎯 ADMIN PANEL READY!");
        log.info("Your products are live and accessible via:");
        log.info("- Firebase Console: https://console.firebase.google.com");
        log.info("- Your admin panel application");
        log.info("- Mobile/web grocery app");
        
    } catch (error) {
        log.error(`Admin panel test failed: ${error.message}`);
    }
}

/**
 * Search for specific products
 */
async function searchProducts(searchTerm) {
    try {
        const firestore = getFirestore();
        if (!firestore) {
            log.error("❌ Firebase not initialized");
            return;
        }
        
        log.info(`🔍 Searching for products containing: "${searchTerm}"`);
        
        const productsRef = firestore.collection('products');
        const snapshot = await productsRef.get();
        
        const results = [];
        snapshot.forEach(doc => {
            const product = doc.data();
            if (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push(product);
            }
        });
        
        log.info(`📋 Found ${results.length} matching products:`);
        results.slice(0, 10).forEach(product => {
            log.info(`   ${product.name} - ₹${product.price} (${product.category})`);
        });
        
        if (results.length > 10) {
            log.info(`   ... and ${results.length - 10} more`);
        }
        
    } catch (error) {
        log.error(`Search failed: ${error.message}`);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0].startsWith('--search=')) {
        const searchTerm = args[0].replace('--search=', '');
        await searchProducts(searchTerm);
    } else {
        await testAdminPanelAccess();
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { testAdminPanelAccess, searchProducts };