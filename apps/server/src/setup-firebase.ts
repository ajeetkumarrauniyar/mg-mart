/**
 * Helper script to set up Firebase configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

function setupFirebase() {
    console.log('🔥 Firebase Setup Helper\n');

    // Check current configuration
    console.log('1. Checking current configuration...');

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const keyFilePath = join(process.cwd(), 'firebase-service-account.json');
    const keyFileExists = existsSync(keyFilePath);

    console.log(`   Project ID: ${projectId || 'Not set'}`);
    console.log(`   Service Account Key (env): ${serviceAccountKey ? 'Set' : 'Not set'}`);
    console.log(`   Service Account Key (file): ${keyFileExists ? 'Found' : 'Not found'}`);

    // Provide setup instructions
    console.log('\n2. Setup Instructions:');

    if (!projectId) {
        console.log('   ❌ FIREBASE_PROJECT_ID not set');
        console.log('   💡 Add to .env: FIREBASE_PROJECT_ID=your-project-id');
    } else {
        console.log('   ✅ FIREBASE_PROJECT_ID configured');
    }

    if (!serviceAccountKey && !keyFileExists) {
        console.log('   ❌ No service account key found');
        console.log('   💡 Option 1: Download firebase-service-account.json to apps/server/');
        console.log('   💡 Option 2: Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    } else if (keyFileExists) {
        console.log('   ✅ Service account key file found');

        // Validate the key file
        try {
            const keyContent = readFileSync(keyFilePath, 'utf8');
            const keyData = JSON.parse(keyContent);

            if (keyData.project_id && keyData.private_key && keyData.client_email) {
                console.log('   ✅ Service account key file is valid');
                console.log(`   📋 Key project ID: ${keyData.project_id}`);
                console.log(`   📋 Client email: ${keyData.client_email}`);

                if (projectId && keyData.project_id !== projectId) {
                    console.log('   ⚠️  Warning: Project ID mismatch between .env and service account key');
                }
            } else {
                console.log('   ❌ Service account key file is missing required fields');
            }
        } catch (error) {
            console.log('   ❌ Service account key file is invalid JSON');
        }
    } else {
        console.log('   ✅ Service account key configured via environment');
    }

    // Firebase setup steps
    console.log('\n3. Firebase Console Setup Steps:');
    console.log('   1. Go to https://console.firebase.google.com/');
    console.log('   2. Create a new project or select existing');
    console.log('   3. Enable Firestore Database');
    console.log('   4. Go to Project Settings → Service Accounts');
    console.log('   5. Click "Generate new private key"');
    console.log('   6. Download and save as firebase-service-account.json');

    // Firestore rules for testing
    console.log('\n4. Firestore Security Rules (for testing):');
    console.log('   Go to Firestore → Rules and use:');
    console.log(`
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // TESTING ONLY!
       }
     }
   }
  `);

    // Test command
    console.log('\n5. Test Configuration:');
    console.log('   Run: pnpm run test-real-config');

    // Migration command
    console.log('\n6. Create Database Collections:');
    console.log('   Run: pnpm run tsx src/migrations/001_create_image_collections.ts');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupFirebase();
}