// Comprehensive app functionality test
const axios = require('axios');

const API_BASE_URL = 'https://mg-mart-server.onrender.com/api/v1';

async function testAppFunctionality() {
    console.log('🧪 Testing MG-MART App Functionality...\n');
    
    let testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };

    const addTest = (name, passed, message) => {
        testResults.tests.push({ name, passed, message });
        if (passed) {
            testResults.passed++;
            console.log(`✅ ${name}: ${message}`);
        } else {
            testResults.failed++;
            console.log(`❌ ${name}: ${message}`);
        }
    };

    try {
        // Test 1: Server Health
        console.log('1. Testing Server Health...');
        try {
            const healthResponse = await axios.get('https://mg-mart-server.onrender.com/health');
            addTest('Server Health', true, `Server is healthy (uptime: ${healthResponse.data.uptime}s)`);
        } catch (error) {
            addTest('Server Health', false, `Server health check failed: ${error.message}`);
        }

        // Test 2: Products API
        console.log('\n2. Testing Products API...');
        try {
            const productsResponse = await axios.get(`${API_BASE_URL}/products`);
            const products = productsResponse.data.data.products;
            addTest('Products API', products.length > 0, `Found ${products.length} products`);
            
            // Test product structure
            const firstProduct = products[0];
            const hasRequiredFields = firstProduct.productId && firstProduct.name && firstProduct.price;
            addTest('Product Structure', hasRequiredFields, 'Products have required fields');
        } catch (error) {
            addTest('Products API', false, `Products API failed: ${error.message}`);
        }

        // Test 3: Authentication API
        console.log('\n3. Testing Authentication API...');
        let authToken = null;
        try {
            // Test registration
            const registerData = {
                firstName: 'Test',
                lastName: 'User',
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                phone: '1234567890'
            };
            
            const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
            authToken = registerResponse.data.data.token;
            addTest('User Registration', !!authToken, 'User registration successful');

            // Test login
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: registerData.email,
                password: registerData.password
            });
            addTest('User Login', !!loginResponse.data.data.token, 'User login successful');
        } catch (error) {
            addTest('Authentication', false, `Auth failed: ${error.message}`);
        }

        // Test 4: Cart API (requires authentication)
        console.log('\n4. Testing Cart API...');
        if (authToken) {
            try {
                // Test get cart
                const cartResponse = await axios.get(`${API_BASE_URL}/cart`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                addTest('Get Cart', true, 'Cart retrieval successful');

                // Test add to cart
                const productsResponse = await axios.get(`${API_BASE_URL}/products`);
                const firstProduct = productsResponse.data.data.products[0];
                
                const addToCartResponse = await axios.post(`${API_BASE_URL}/cart/add`, {
                    productId: firstProduct.productId,
                    quantity: 1
                }, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                addTest('Add to Cart', true, 'Item added to cart successfully');

                // Test cart with items
                const updatedCartResponse = await axios.get(`${API_BASE_URL}/cart`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const hasItems = updatedCartResponse.data.data.items.length > 0;
                addTest('Cart with Items', hasItems, `Cart has ${updatedCartResponse.data.data.items.length} items`);
            } catch (error) {
                addTest('Cart API', false, `Cart operations failed: ${error.message}`);
            }
        } else {
            addTest('Cart API', false, 'Skipped - no auth token');
        }

        // Test 5: Order API (requires authentication and cart items)
        console.log('\n5. Testing Order API...');
        if (authToken) {
            try {
                const orderData = {
                    paymentMethod: 'COD',
                    shippingAddress: {
                        street: '123 Test Street',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        zipCode: '400001'
                    },
                    notes: 'Test order'
                };

                const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                addTest('Create Order', true, `Order created: ${orderResponse.data.data.orderId}`);

                // Test get orders
                const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                addTest('Get Orders', true, `Found ${ordersResponse.data.data.orders.length} orders`);
            } catch (error) {
                addTest('Order API', false, `Order operations failed: ${error.message}`);
            }
        } else {
            addTest('Order API', false, 'Skipped - no auth token');
        }

        // Test 6: Performance Check
        console.log('\n6. Testing Performance...');
        const startTime = Date.now();
        try {
            await axios.get(`${API_BASE_URL}/products`);
            const responseTime = Date.now() - startTime;
            addTest('API Performance', responseTime < 2000, `Products API responded in ${responseTime}ms`);
        } catch (error) {
            addTest('API Performance', false, `Performance test failed: ${error.message}`);
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! App is ready for production.');
    } else {
        console.log('\n⚠️ Some tests failed. Please review and fix issues before production.');
    }

    return testResults;
}

testAppFunctionality();