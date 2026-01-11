/**
 * Test script for API endpoints
 * This script tests the REST API endpoints with real data
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api/v1';
const TEST_PRODUCT_ID = 'test-product-' + Date.now();

// Mock JWT token for testing (you'll need to implement real auth)
const MOCK_TOKEN = 'mock-jwt-token';

async function testApiEndpoints() {
    console.log('🧪 Testing API Endpoints...\n');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test Product ID: ${TEST_PRODUCT_ID}\n`);

    try {
        // Test 1: Health Check (no auth required)
        console.log('1. 🏥 Testing Health Check...');
        try {
            const response = await axios.get(`${BASE_URL}/image-management/health`);
            console.log('   ✅ Health Check Response:', response.data);
        } catch (error) {
            console.log('   ❌ Health Check Failed:', error instanceof Error ? error.message : 'Unknown error');
        }

        // Test 2: Statistics (requires auth)
        console.log('\n2. 📊 Testing Statistics...');
        try {
            const response = await axios.get(`${BASE_URL}/image-management/statistics`, {
                headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
            });
            console.log('   ✅ Statistics Response:', response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.log('   ⚠️  Authentication required (expected without real JWT)');
            } else {
                console.log('   ❌ Statistics Failed:', error instanceof Error ? error.message : 'Unknown error');
            }
        }

        // Test 3: Discover Images (requires auth)
        console.log('\n3. 🔍 Testing Image Discovery...');
        try {
            const response = await axios.post(
                `${BASE_URL}/products/${TEST_PRODUCT_ID}/discover-images`,
                {},
                { headers: { Authorization: `Bearer ${MOCK_TOKEN}` } }
            );
            console.log('   ✅ Image Discovery Response:', response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.log('   ⚠️  Authentication required (expected without real JWT)');
            } else {
                console.log('   ❌ Image Discovery Failed:', error instanceof Error ? error.message : 'Unknown error');
            }
        }

        // Test 4: Get Processing Status (requires auth)
        console.log('\n4. 📋 Testing Processing Status...');
        try {
            const response = await axios.get(
                `${BASE_URL}/products/${TEST_PRODUCT_ID}/processing-status`,
                { headers: { Authorization: `Bearer ${MOCK_TOKEN}` } }
            );
            console.log('   ✅ Processing Status Response:', response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.log('   ⚠️  Authentication required (expected without real JWT)');
            } else if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log('   ⚠️  No processing status found (expected for new product)');
            } else {
                console.log('   ❌ Processing Status Failed:', error instanceof Error ? error.message : 'Unknown error');
            }
        }

        console.log('\n📝 Notes:');
        console.log('   - Authentication errors are expected without real JWT tokens');
        console.log('   - 404 errors are expected for non-existent products');
        console.log('   - Health check should work without authentication');
        console.log('\n💡 To test with authentication:');
        console.log('   1. Implement JWT token generation');
        console.log('   2. Or temporarily disable auth middleware');
        console.log('   3. Update MOCK_TOKEN with real JWT');

    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

async function testServerConnection() {
    console.log('🔌 Testing Server Connection...\n');

    try {
        // Test basic server connection
        const response = await axios.get('http://localhost:5000/', { timeout: 5000 });
        console.log('✅ Server is running');
        console.log('📋 Server Response:', response.data);
        return true;
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running');
            console.log('💡 Start the server with: pnpm run dev');
        } else {
            console.log('❌ Connection error:', error instanceof Error ? error.message : 'Unknown error');
        }
        return false;
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testServerConnection()
        .then(async (serverRunning) => {
            if (serverRunning) {
                await testApiEndpoints();
            }
            console.log('\n✨ API endpoint test completed');
        })
        .catch((error) => {
            console.error('💥 API test suite failed:', error);
            process.exit(1);
        });
}