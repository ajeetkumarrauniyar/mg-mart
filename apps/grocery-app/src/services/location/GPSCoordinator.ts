// GPS coordinate fetching with accuracy validation and retry logic
import * as Location from 'expo-location';
import type { GPSCoordinator as IGPSCoordinator } from './interfaces';
import type { LocationCoordinates, LocationOptions } from './types';
import { ACCURACY_THRESHOLDS, LOCATION_TIMEOUTS, RETRY_SETTINGS } from '../../constants';
import { validateCoordinates, createTimestamp } from './utils';

/**
 * Manages GPS coordinate fetching with accuracy validation and retry logic
 */
export class GPSCoordinator implements IGPSCoordinator {
    /**
     * Fetches current location with specified options
     * @param options Location fetch options
     * @returns Current location coordinates
     */
    async fetchLocation(options: LocationOptions): Promise<LocationCoordinates> {
        try {
            const locationResult = await Location.getCurrentPositionAsync({
                accuracy: this.mapAccuracyToExpo(options.enableHighAccuracy),
            });

            const coordinates: LocationCoordinates = {
                latitude: locationResult.coords.latitude,
                longitude: locationResult.coords.longitude,
                accuracy: locationResult.coords.accuracy || 999999, // Default to poor accuracy if not provided
                ...(locationResult.coords.altitude !== null && locationResult.coords.altitude !== undefined && { altitude: locationResult.coords.altitude }),
                ...(locationResult.coords.heading !== null && locationResult.coords.heading !== undefined && { heading: locationResult.coords.heading }),
                ...(locationResult.coords.speed !== null && locationResult.coords.speed !== undefined && { speed: locationResult.coords.speed }),
                timestamp: locationResult.timestamp || createTimestamp(),
            };

            // Validate coordinates before returning
            if (!validateCoordinates(coordinates)) {
                throw new Error('Invalid coordinates received from GPS');
            }

            return coordinates;
        } catch (error) {
            console.error('Error fetching location:', error);
            throw new Error(`Failed to fetch location: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validates if GPS accuracy is acceptable
     * @param coordinates Location coordinates to validate
     * @returns True if accuracy is acceptable
     */
    validateAccuracy(coordinates: LocationCoordinates): boolean {
        return coordinates.accuracy <= ACCURACY_THRESHOLDS.ACCEPTABLE;
    }

    /**
     * Fetches location with retry logic for poor accuracy
     * @param maxRetries Maximum number of retry attempts
     * @returns Location coordinates with acceptable accuracy
     */
    async retryLocationFetch(maxRetries: number = RETRY_SETTINGS.MAX_LOCATION_RETRIES): Promise<LocationCoordinates> {
        let lastError: Error | null = null;
        let bestLocation: LocationCoordinates | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const options = this.getLocationOptionsForAttempt(attempt);
                const location = await this.fetchLocation(options);

                // Keep track of the best location we've gotten so far
                if (!bestLocation || location.accuracy < bestLocation.accuracy) {
                    bestLocation = location;
                }

                // If accuracy is acceptable, return immediately
                if (this.validateAccuracy(location)) {
                    return location;
                }

                // If this is not the last attempt, wait before retrying
                if (attempt < maxRetries - 1) {
                    await this.delay(this.calculateRetryDelay(attempt));
                }

            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                console.warn(`Location fetch attempt ${attempt + 1} failed:`, error);

                // If this is not the last attempt, wait before retrying
                if (attempt < maxRetries - 1) {
                    await this.delay(this.calculateRetryDelay(attempt));
                }
            }
        }

        // If we have a location (even with poor accuracy), return it
        if (bestLocation) {
            console.warn('Returning location with poor accuracy after retries:', bestLocation.accuracy);
            return bestLocation;
        }

        // If all attempts failed, throw the last error
        throw lastError || new Error('Failed to fetch location after all retry attempts');
    }

    /**
     * Fetches location with quick timeout for immediate needs
     * @returns Location coordinates or null if not available quickly
     */
    async fetchLocationQuick(): Promise<LocationCoordinates | null> {
        try {
            const options: LocationOptions = {
                enableHighAccuracy: false,
                timeout: LOCATION_TIMEOUTS.QUICK_FETCH,
                maximumAge: 60000, // Accept cached location up to 1 minute old
                minimumAccuracy: ACCURACY_THRESHOLDS.POOR, // Accept poor accuracy for quick fetch
            };

            return await this.fetchLocation(options);
        } catch (error) {
            console.warn('Quick location fetch failed:', error);
            return null;
        }
    }

    /**
     * Fetches high-accuracy location for critical operations
     * @returns High-accuracy location coordinates
     */
    async fetchHighAccuracyLocation(): Promise<LocationCoordinates> {
        const options: LocationOptions = {
            enableHighAccuracy: true,
            timeout: LOCATION_TIMEOUTS.EXTENDED_FETCH,
            maximumAge: 0, // Don't accept cached location
            minimumAccuracy: ACCURACY_THRESHOLDS.GOOD,
        };

        return await this.retryLocationFetch(RETRY_SETTINGS.MAX_LOCATION_RETRIES);
    }

    /**
     * Checks if location services are working properly
     * @returns True if location services are functional
     */
    async testLocationServices(): Promise<boolean> {
        try {
            const quickLocation = await this.fetchLocationQuick();
            return quickLocation !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Gets location options optimized for specific attempt number
     * @param attemptNumber Current attempt number (0-based)
     * @returns Optimized location options
     */
    private getLocationOptionsForAttempt(attemptNumber: number): LocationOptions {
        // First attempt: Quick and balanced
        if (attemptNumber === 0) {
            return {
                enableHighAccuracy: false,
                timeout: LOCATION_TIMEOUTS.QUICK_FETCH,
                maximumAge: 30000, // Accept 30-second old location
                minimumAccuracy: ACCURACY_THRESHOLDS.ACCEPTABLE,
            };
        }

        // Second attempt: Higher accuracy, longer timeout
        if (attemptNumber === 1) {
            return {
                enableHighAccuracy: true,
                timeout: LOCATION_TIMEOUTS.NORMAL_FETCH,
                maximumAge: 10000, // Accept 10-second old location
                minimumAccuracy: ACCURACY_THRESHOLDS.GOOD,
            };
        }

        // Final attempt: Maximum accuracy and timeout
        return {
            enableHighAccuracy: true,
            timeout: LOCATION_TIMEOUTS.EXTENDED_FETCH,
            maximumAge: 0, // No cached location
            minimumAccuracy: ACCURACY_THRESHOLDS.EXCELLENT,
        };
    }

    /**
     * Calculates retry delay with exponential backoff
     * @param attemptNumber Current attempt number (0-based)
     * @returns Delay in milliseconds
     */
    private calculateRetryDelay(attemptNumber: number): number {
        const delay = RETRY_SETTINGS.RETRY_DELAY_BASE * Math.pow(2, attemptNumber);
        return Math.min(delay, RETRY_SETTINGS.RETRY_DELAY_MAX);
    }

    /**
     * Maps our accuracy preference to Expo location accuracy
     * @param enableHighAccuracy Whether high accuracy is requested
     * @returns Expo location accuracy setting
     */
    private mapAccuracyToExpo(enableHighAccuracy: boolean): Location.LocationAccuracy {
        return enableHighAccuracy
            ? Location.LocationAccuracy.Highest
            : Location.LocationAccuracy.Balanced;
    }

    /**
     * Utility method to create delays
     * @param ms Milliseconds to delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Gets accuracy level description for user display
     * @param accuracy Accuracy in meters
     * @returns User-friendly accuracy description
     */
    getAccuracyDescription(accuracy: number): string {
        if (accuracy <= ACCURACY_THRESHOLDS.EXCELLENT) {
            return 'Excellent';
        } else if (accuracy <= ACCURACY_THRESHOLDS.GOOD) {
            return 'Good';
        } else if (accuracy <= ACCURACY_THRESHOLDS.ACCEPTABLE) {
            return 'Acceptable';
        } else if (accuracy <= ACCURACY_THRESHOLDS.POOR) {
            return 'Poor';
        } else {
            return 'Very Poor';
        }
    }

    /**
     * Estimates time to get acceptable accuracy based on current conditions
     * @param currentAccuracy Current GPS accuracy
     * @returns Estimated time in seconds
     */
    estimateTimeToAccuracy(currentAccuracy: number): number {
        if (currentAccuracy <= ACCURACY_THRESHOLDS.ACCEPTABLE) {
            return 0; // Already acceptable
        } else if (currentAccuracy <= ACCURACY_THRESHOLDS.POOR) {
            return 10; // Should improve in ~10 seconds
        } else {
            return 30; // May take up to 30 seconds
        }
    }
}

// Export singleton instance
export const gpsCoordinator = new GPSCoordinator();