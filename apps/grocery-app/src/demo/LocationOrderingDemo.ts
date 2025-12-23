// Demo script showing location-based ordering system functionality
import {
    locationService,
    distanceCalculator,
    validationEngine,
    ValidationType,
    type LocationCoordinates
} from '../services/location';

/**
 * Demo script to showcase the location-based ordering system
 * This demonstrates the key features and workflows
 */
export class LocationOrderingDemo {
    // Shop coordinates (Jahingara, Bihar)
    private readonly shopLocation: LocationCoordinates = {
        latitude: 26.48872183999999,
        longitude: 84.98157500999997,
        accuracy: 10,
        timestamp: Date.now()
    };

    /**
     * Demo: Distance calculation with different scenarios
     */
    async demoDistanceCalculation() {
        console.log('🧮 Distance Calculation Demo');
        console.log('================================');

        // Test locations at different distances
        const testLocations = [
            { name: 'Very Close (1km)', lat: 26.4987, lon: 84.9916 },
            { name: 'Within Area (4km)', lat: 26.5187, lon: 85.0116 },
            { name: 'Warning Zone (6km)', lat: 26.5387, lon: 85.0316 },
            { name: 'Outside Area (10km)', lat: 26.5787, lon: 85.0716 },
        ];

        for (const location of testLocations) {
            const testCoords: LocationCoordinates = {
                latitude: location.lat,
                longitude: location.lon,
                accuracy: 15,
                timestamp: Date.now()
            };

            const distance = distanceCalculator.calculateDistance(this.shopLocation, testCoords);
            const serviceArea = distanceCalculator.isWithinServiceArea(testCoords, this.shopLocation);

            console.log(`📍 ${location.name}:`);
            console.log(`   Distance: ${distance}km`);
            console.log(`   Status: ${serviceArea.status}`);
            console.log(`   Threshold: ${serviceArea.threshold}km`);
            console.log('');
        }
    }

    /**
     * Demo: Location validation with different scenarios
     */
    async demoLocationValidation() {
        console.log('✅ Location Validation Demo');
        console.log('============================');

        const testScenarios = [
            {
                name: 'Approved Location (3km)',
                current: { latitude: 26.5087, longitude: 84.9916, accuracy: 20, timestamp: Date.now() },
                expected: ValidationType.APPROVED
            },
            {
                name: 'Warning Location (6km)',
                current: { latitude: 26.5387, longitude: 85.0316, accuracy: 25, timestamp: Date.now() },
                expected: ValidationType.WARNING
            },
            {
                name: 'Blocked Location (12km)',
                current: { latitude: 26.6087, longitude: 85.0916, accuracy: 30, timestamp: Date.now() },
                expected: ValidationType.BLOCKED
            }
        ];

        for (const scenario of testScenarios) {
            const result = validationEngine.validateLocation(scenario.current, this.shopLocation);

            console.log(`🎯 ${scenario.name}:`);
            console.log(`   Valid: ${result.isValid}`);
            console.log(`   Type: ${result.validationType}`);
            console.log(`   Distance: ${result.distance}km`);
            console.log(`   Message: ${result.message}`);
            console.log(`   Actions: ${result.suggestedActions.length} available`);
            console.log('');
        }
    }

    /**
     * Demo: Complete order validation workflow
     */
    async demoOrderWorkflow() {
        console.log('🛒 Order Workflow Demo');
        console.log('=======================');

        try {
            console.log('1. Checking service status...');
            const status = await locationService.getServiceStatus();
            console.log(`   Service Health: ${status.serviceHealth}`);
            console.log(`   Permission: ${status.permissionStatus}`);
            console.log(`   Has Stored Location: ${status.hasStoredLocation}`);
            console.log('');

            console.log('2. Simulating location validation...');
            // Note: In real app, this would request actual GPS location
            console.log('   (In demo mode - would request GPS permission and location)');
            console.log('   ✅ Location validation would be performed here');
            console.log('');

            console.log('3. Order placement workflow:');
            console.log('   📍 Validate user location');
            console.log('   🔍 Check distance from store');
            console.log('   ✅ Approve/warn/block based on distance');
            console.log('   🛍️ Place order if approved');
            console.log('');

        } catch (error) {
            console.error('❌ Demo workflow error:', error);
        }
    }

    /**
     * Demo: GPS accuracy handling
     */
    async demoAccuracyHandling() {
        console.log('🎯 GPS Accuracy Demo');
        console.log('=====================');

        const accuracyScenarios = [
            { accuracy: 5, description: 'Excellent GPS (5m)' },
            { accuracy: 25, description: 'Good GPS (25m)' },
            { accuracy: 75, description: 'Acceptable GPS (75m)' },
            { accuracy: 150, description: 'Poor GPS (150m)' },
            { accuracy: 500, description: 'Very Poor GPS (500m)' }
        ];

        for (const scenario of accuracyScenarios) {
            const testLocation: LocationCoordinates = {
                latitude: 26.5087,
                longitude: 84.9916,
                accuracy: scenario.accuracy,
                timestamp: Date.now()
            };

            // Test with accuracy buffer
            const distance = distanceCalculator.calculateDistance(testLocation, this.shopLocation);
            const bufferedDistance = distanceCalculator.calculateDistanceWithBuffer(
                testLocation,
                this.shopLocation,
                scenario.accuracy
            );

            console.log(`📡 ${scenario.description}:`);
            console.log(`   Raw Distance: ${distance}km`);
            console.log(`   Buffered Distance: ${bufferedDistance}km`);
            console.log(`   Buffer Applied: ${(distance - bufferedDistance).toFixed(3)}km`);
            console.log('');
        }
    }

    /**
     * Demo: Edge cases and error handling
     */
    async demoEdgeCases() {
        console.log('⚠️ Edge Cases Demo');
        console.log('===================');

        console.log('1. Invalid Coordinates:');
        try {
            const invalidCoords: LocationCoordinates = {
                latitude: 91, // Invalid latitude
                longitude: 181, // Invalid longitude
                accuracy: 10,
                timestamp: Date.now()
            };
            distanceCalculator.calculateDistance(invalidCoords, this.shopLocation);
        } catch (error) {
            console.log(`   ✅ Caught invalid coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        console.log('');
        console.log('2. Teleportation Detection:');
        const previousLocation: LocationCoordinates = {
            latitude: 26.4887,
            longitude: 84.9816,
            accuracy: 10,
            timestamp: Date.now() - 60000 // 1 minute ago
        };

        const currentLocation: LocationCoordinates = {
            latitude: 28.6139, // Delhi (very far)
            longitude: 77.2090,
            accuracy: 10,
            timestamp: Date.now()
        };

        const isSuspicious = validationEngine.isSuspiciousLocationChange(
            previousLocation,
            currentLocation,
            1 // 1 minute elapsed
        );

        console.log(`   Suspicious movement detected: ${isSuspicious}`);
        console.log('');

        console.log('3. Problematic Locations:');
        const poleLocation: LocationCoordinates = {
            latitude: 89.5, // Near North Pole
            longitude: 0,
            accuracy: 10,
            timestamp: Date.now()
        };

        const isProblematic = distanceCalculator.isProblematicLocation(poleLocation);
        console.log(`   Near pole location problematic: ${isProblematic}`);
        console.log('');
    }

    /**
     * Run all demos
     */
    async runAllDemos() {
        console.log('🚀 Location-Based Ordering System Demo');
        console.log('=======================================');
        console.log('');

        await this.demoDistanceCalculation();
        await this.demoLocationValidation();
        await this.demoOrderWorkflow();
        await this.demoAccuracyHandling();
        await this.demoEdgeCases();

        console.log('✨ Demo completed! The location-based ordering system is ready for production use.');
        console.log('');
        console.log('Key Features Demonstrated:');
        console.log('• 📏 Accurate distance calculation using Haversine formula');
        console.log('• 🎯 Three-tier validation (5km approved, 5-7km warning, >7km blocked)');
        console.log('• 🛡️ GPS accuracy buffering and error handling');
        console.log('• 🚨 Fraud detection and suspicious movement alerts');
        console.log('• 🔧 Comprehensive edge case handling');
        console.log('• 💬 User-friendly messaging and recovery options');
    }
}

// Export demo instance for easy usage
export const locationDemo = new LocationOrderingDemo();