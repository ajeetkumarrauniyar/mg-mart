const fs = require('fs');
const path = require('path');
const { testFirebaseConnection, getProductCount } = require('./firebase-config');

// Enhanced logging
const log = {
    info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
    success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
    warn: (msg) => console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`),
    error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`)
};

/**
 * Check Firebase setup and configuration
 */
async function checkFirebaseSetup() {
    log.info("🔥 Checking Firebase setup...");
    
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    
    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
        log.error("❌ Firebase service account key not found!");
        log.info("");
        log.info("📋 SETUP INSTRUCTIONS:");
        log.info("1. Go to Firebase Console: https://console.firebase.google.com");
        log.info("2. Select your project (or create one)");
        log.info("3. Go to Project Settings > Service Accounts");
        log.info("4. Click 'Generate new private key'");
        log.info("5. Save the downloaded JSON file as 'firebase-service-account.json'");
        log.info(`6. Place it in: ${__dirname}`);
        log.info("");
        log.warn("⚠️  Cannot proceed without Firebase credentials");
        return false;
    }
    
    log.success("✅ Firebase service account key found");
    
    // Test connection
    const connectionOk = await testFirebaseConnection();
    if (!connectionOk) {
        log.error("❌ Firebase connection failed");
        return false;
    }
    
    // Get current product count
    try {
        const productCount = await getProductCount();
        log.info(`📊 Current products in Firestore: ${productCount}`);
        
        if (productCount > 0) {
            log.info("💡 Existing products found. New sync will merge with existing data.");
        } else {
            log.info("🆕 No existing products found. This will be a fresh upload.");
        }
        
    } catch (error) {
        log.warn(`⚠️  Could not get product count: ${error.message}`);
    }
    
    log.success("🎉 Firebase setup is complete and ready!");
    return true;
}

/**
 * Create sample Firebase service account template
 */
function createServiceAccountTemplate() {
    const templatePath = path.join(__dirname, 'firebase-service-account-template.json');
    
    const template = {
        "type": "service_account",
        "project_id": "your-project-id",
        "private_key_id": "your-private-key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
        "client_id": "your-client-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
    };
    
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    log.info(`📄 Template created: ${templatePath}`);
    log.warn("⚠️  This is just a template. Replace with your actual Firebase credentials.");
}

/**
 * Main setup function
 */
async function main() {
    try {
        log.info("🚀 Firebase Setup Checker");
        log.info("=".repeat(50));
        
        const setupOk = await checkFirebaseSetup();
        
        if (!setupOk) {
            log.info("");
            log.info("🔧 Would you like me to create a template file?");
            createServiceAccountTemplate();
        }
        
        log.info("");
        log.info("🎯 NEXT STEPS:");
        if (setupOk) {
            log.success("✅ Firebase is ready! Run 'npm start' to sync products");
        } else {
            log.info("1. Complete Firebase setup (see instructions above)");
            log.info("2. Run this script again to verify: node firebase-setup.js");
            log.info("3. Then run the sync: npm start");
        }
        
    } catch (error) {
        log.error(`Setup check failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { checkFirebaseSetup, createServiceAccountTemplate };