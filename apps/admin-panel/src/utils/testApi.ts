import { authService } from '../services'

// Test function to verify API connectivity
export const testApiConnection = async () => {
    try {
        console.log('🧪 Testing API connection...')

        // Test login with the demo credentials
        const testCredentials = {
            email: 'ajeetkumar5487@gmail.com',
            password: '123456'
        }

        const response = await authService.login(testCredentials)
        console.log('✅ API connection successful:', response)

        // Logout after test
        await authService.logout()
        console.log('✅ Test completed successfully')

        return true
    } catch (error) {
        console.error('❌ API connection failed:', error)
        return false
    }
}

// Function to test individual endpoints
export const testEndpoints = {
    auth: {
        login: async () => {
            try {
                const response = await authService.login({
                    email: 'ajeetkumar5487@gmail.com',
                    password: '123456'
                })
                console.log('Auth login test:', response)
                return response
            } catch (error) {
                console.error('Auth login test failed:', error)
                throw error
            }
        }
    }
}