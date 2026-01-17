// GPS coordinate fetching with accuracy validation and retry logic
import * as Location from 'expo-location';
import type { GPSCoordinator as IGPSCoordinator } from './interfaces';
import type { LocationCoordinates, LocationOptions } from './types';
import { ACCURACY_THRESHOLDS, LOCATION_TIMEOUTS, RETRY_SETTINGS } from './constants';
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

            // Validate that we have essential coordinate data
            if (locationResult.coords.latitude == null || locationResult.coords.longitude == null) {
                throw new Error('GPS returned null coordinates');
            }

            // Check for NaN coordinates
            if (isNaN(locationResult.coords.latitude) || isNaN(locationResult.coords.longitude)) {
                throw new Error('GPS returned NaN coordinates');
            }

            // Validate accuracy - if missing, this is a critical error
            if (locationResult.coords.accuracy == null || isNaN(locationResult.coords.accuracy)) {
                throw new Error('GPS accuracy information is missing or invalid');
            }

            const coordinates: LocationCoordinates = {
                latitude: locationResult.coords.latitude,
                longitude: locationResult.coords.longitude,
                accuracy: locationResult.coords.accuracy,
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
     * Enhanced with progressive accuracy improvement
     * @param maxRetries Maximum number of retry attempts
     * @returns Location coordinates with acceptable accuracy
     */
    async retryLocationFetch(maxRetries: number = RETRY_SETTINGS.MAX_LOCATION_RETRIES): Promise<LocationCoordinates> {
        let lastError: Error | null = null;
        let bestLocation: LocationCoordinates | null = null;
        const locationReadings: LocationCoordinates[] = [];

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const options = this.getLocationOptionsForAttempt(attempt);
                const location = await this.fetchLocation(options);

                // Store all readings for potential averaging
                locationReadings.push(location);

                // Keep track of the best location we've gotten so far
                if (!bestLocation || location.accuracy < bestLocation.accuracy) {
                    // Only update if accuracy improved significantly
                    if (!bestLocation ||
                        (location.accuracy < bestLocation.accuracy - RETRY_SETTINGS.MIN_ACCURACY_IMPROVEMENT)) {
                        bestLocation = location;
                        console.log(`Improved accuracy: ${location.accuracy.toFixed(1)}m (attempt ${attempt + 1})`);
                    }
                }

                // If accuracy is excellent, return immediately
                if (location.accuracy <= ACCURACY_THRESHOLDS.EXCELLENT) {
                    console.log(`Excellent accuracy achieved: ${location.accuracy.toFixed(1)}m`);
                    return location;
                }

                // If accuracy is acceptable and we've tried at least twice, return
                if (this.validateAccuracy(location) && attempt >= 1) {
                    console.log(`Acceptable accuracy achieved: ${location.accuracy.toFixed(1)}m`);
                    return location;
                }

                // If this is not the last attempt, wait before retrying
                if (attempt < maxRetries - 1) {
                    const delay = this.calculateRetryDelay(attempt);
                    console.log(`Waiting ${delay}ms before next attempt...`);
                    await this.delay(delay);
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

        // If we have multiple readings, try averaging for better accuracy
        if (locationReadings.length >= 3) {
            const averagedLocation = this.averageLocationReadings(locationReadings);
            if (averagedLocation.accuracy < (bestLocation?.accuracy || Infinity)) {
                console.log(`Using averaged location with accuracy: ${averagedLocation.accuracy.toFixed(1)}m`);
                return averagedLocation;
            }
        }

        // If we have a location (even with poor accuracy), return it
        if (bestLocation) {
            console.warn(`Returning best location with accuracy: ${bestLocation.accuracy.toFixed(1)}m after ${maxRetries} attempts`);
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
     * Uses extended timeout and multiple readings for best precision
     * @returns High-accuracy location coordinates
     */
    async fetchHighAccuracyLocation(): Promise<LocationCoordinates> {
        console.log('Fetching high-accuracy location with extended timeout...');

        // Use maximum retries for critical operations
        return await this.retryLocationFetch(RETRY_SETTINGS.MAX_LOCATION_RETRIES);
    }

    /**
     * Fetches ultra-precise location for order validation
     * Takes multiple readings and averages them for best accuracy
     * @returns Ultra-precise location coordinates
     */
    async fetchUltraPreciseLocation(): Promise<LocationCoordinates> {
        console.log('Fetching ultra-precise location with multiple readings...');

        const readings: LocationCoordinates[] = [];
        const numReadings = 3; // Take 3 readings for averaging

        for (let i = 0; i < numReadings; i++) {
            try {
                const location = await this.fetchLocation({
                    enableHighAccuracy: true,
                    timeout: LOCATION_TIMEOUTS.HIGH_PRECISION,
                    maximumAge: 0,
                    minimumAccuracy: ACCURACY_THRESHOLDS.EXCELLENT,
                });

                readings.push(location);
                console.log(`Reading ${i + 1}/${numReadings}: accuracy ${location.accuracy.toFixed(1)}m`);

                // Small delay between readings to allow GPS to stabilize
                if (i < numReadings - 1) {
                    await this.delay(3000); // 3 second delay between readings
                }
            } catch (error) {
                console.warn(`Failed to get reading ${i + 1}:`, error);
            }
        }

        if (readings.length === 0) {
            throw new Error('Failed to get any location readings');
        }

        // If we only got one reading, return it
        if (readings.length === 1) {
            return readings[0];
        }

        // Average multiple readings for better accuracy
        return this.averageLocationReadings(readings);
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
     * Progressive accuracy improvement with each attempt
     * @param attemptNumber Current attempt number (0-based)
     * @returns Optimized location options
     */
    private getLocationOptionsForAttempt(attemptNumber: number): LocationOptions {
        // First attempt: Balanced approach
        if (attemptNumber === 0) {
            return {
                enableHighAccuracy: true,
                timeout: LOCATION_TIMEOUTS.NORMAL_FETCH,
                maximumAge: 10000, // Accept 10-second old location
                minimumAccuracy: ACCURACY_THRESHOLDS.GOOD,
            };
        }

        // Second attempt: Higher accuracy, longer timeout
        if (attemptNumber === 1) {
            return {
                enableHighAccuracy: true,
                timeout: LOCATION_TIMEOUTS.EXTENDED_FETCH,
                maximumAge: 5000, // Accept 5-second old location
                minimumAccuracy: ACCURACY_THRESHOLDS.EXCELLENT,
            };
        }

        // Third attempt: Maximum accuracy
        if (attemptNumber === 2) {
            return {
                enableHighAccuracy: true,
                timeout: LOCATION_TIMEOUTS.HIGH_PRECISION,
                maximumAge: 0, // No cached location
                minimumAccuracy: ACCURACY_THRESHOLDS.EXCELLENT,
            };
        }

        // Fourth+ attempts: Ultra-precise with maximum timeout
        return {
            enableHighAccuracy: true,
            timeout: LOCATION_TIMEOUTS.HIGH_PRECISION,
            maximumAge: 0, // No cached location
            minimumAccuracy: ACCURACY_THRESHOLDS.EXCELLENT,
        };
    }

    /**
     * Averages multiple location readings for improved accuracy
     * Uses weighted average based on accuracy (better accuracy = higher weight)
     * @param readings Array of location readings
     * @returns Averaged location with improved accuracy
     */
    private averageLocationReadings(readings: LocationCoordinates[]): LocationCoordinates {
        if (readings.length === 0) {
            throw new Error('Cannot average empty readings array');
        }

        // Validate all readings before processing
        const validReadings = readings.filter(reading => {
            if (!validateCoordinates(reading)) {
                console.warn('Invalid reading detected, excluding from average:', reading);
                return false;
            }
            if (isNaN(reading.latitude) || isNaN(reading.longitude) || isNaN(reading.accuracy)) {
                console.warn('NaN values detected in reading, excluding from average:', reading);
                return false;
            }
            return true;
        });

        // Check if we have any valid readings left
        if (validReadings.length === 0) {
            throw new Error('No valid GPS readings available for averaging');
        }

        if (validReadings.length === 1) {
            return validReadings[0];
        }

        // Calculate weights based on accuracy (inverse of accuracy)
        // Better accuracy (lower value) gets higher weight
        const weights = validReadings.map(r => {
            if (r.accuracy <= 0 || isNaN(r.accuracy)) {
                console.warn('Invalid accuracy detected:', r.accuracy);
                return 0.001; // Very small weight for invalid accuracy
            }
            return 1 / (r.accuracy + 1); // +1 to avoid division by zero
        });

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        if (totalWeight === 0 || isNaN(totalWeight)) {
            throw new Error('Cannot calculate weighted average - invalid weights');
        }

        // Weighted average of coordinates
        let avgLat = 0;
        let avgLon = 0;
        let avgAlt = 0;
        let hasAltitude = false;

        validReadings.forEach((reading, i) => {
            const weight = weights[i] / totalWeight;
            avgLat += reading.latitude * weight;
            avgLon += reading.longitude * weight;
            if (reading.altitude !== undefined) {
                avgAlt += reading.altitude * weight;
                hasAltitude = true;
            }
        });

        // Calculate standard deviation for accuracy estimation
        const latStdDev = Math.sqrt(
            validReadings.reduce((sum, r) => sum + Math.pow(r.latitude - avgLat, 2), 0) / validReadings.length
        );
        const lonStdDev = Math.sqrt(
            validReadings.reduce((sum, r) => sum + Math.pow(r.longitude - avgLon, 2), 0) / validReadings.length
        );

        // Convert coordinate std dev to meters (approximate)
        const latMeters = latStdDev * 111000; // 1 degree latitude ≈ 111km
        const lonMeters = lonStdDev * 111000 * Math.cos(avgLat * Math.PI / 180);
        const estimatedAccuracy = Math.sqrt(latMeters * latMeters + lonMeters * lonMeters);

        // Use the better of: averaged accuracy or best individual accuracy
        const bestIndividualAccuracy = Math.min(...validReadings.map(r => r.accuracy));
        const finalAccuracy = Math.min(estimatedAccuracy, bestIndividualAccuracy);

        // Validate final result
        if (isNaN(avgLat) || isNaN(avgLon) || isNaN(finalAccuracy)) {
            console.error('Averaging resulted in NaN values:', {
                avgLat,
                avgLon,
                finalAccuracy,
                validReadings,
                weights,
                totalWeight
            });
            throw new Error('Location averaging failed - result contains NaN values');
        }

        console.log(`Averaged ${validReadings.length} readings: accuracy improved to ${finalAccuracy.toFixed(1)}m`);

        const result = {
            latitude: avgLat,
            longitude: avgLon,
            accuracy: finalAccuracy,
            ...(hasAltitude && { altitude: avgAlt }),
            timestamp: Date.now(),
        };

        // Final validation of the result
        if (!validateCoordinates(result)) {
            throw new Error('Averaged location failed validation');
        }

        return result;
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