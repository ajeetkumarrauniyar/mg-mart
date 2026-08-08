// Main location service orchestrator
import type { LocationService as ILocationService } from './interfaces';
import type { LocationCoordinates, LocationValidationResult, LocationData } from './types';
import { PermissionStatus } from './types';
import { PermissionManager } from './PermissionManager';
import { GPSCoordinator } from './GPSCoordinator';
import { ValidationEngine } from './ValidationEngine';
import { LocationStorage } from './LocationStorage';
import { MessageService } from './MessageService';
import { LOCATION_TIMEOUTS, ACCURACY_THRESHOLDS, RETRY_SETTINGS } from '../../constants';
import { createTimestamp, generateLocationId } from './utils';

/**
 * Main location service that orchestrates all location-related operations
 */
export class LocationService implements ILocationService {
    private permissionManager: PermissionManager;
    private gpsCoordinator: GPSCoordinator;
    private validationEngine: ValidationEngine;
    private locationStorage: LocationStorage;
    private messageService: MessageService;

    // Add request queuing to prevent concurrent permission requests
    private locationRequestQueue: Promise<LocationCoordinates> | null = null;
    private permissionRequestQueue: Promise<PermissionStatus> | null = null;

    constructor() {
        this.permissionManager = new PermissionManager();
        this.gpsCoordinator = new GPSCoordinator();
        this.validationEngine = new ValidationEngine();
        this.locationStorage = new LocationStorage();
        this.messageService = new MessageService();
    }

    /**
     * Main method to validate user location for order placement
     * Uses high-precision location fetching for accurate validation
     * @returns Complete validation result
     */
    async validateOrderLocation(): Promise<LocationValidationResult> {
        try {
            // Step 1: Check and request permissions if needed
            const permissionStatus = await this.ensureLocationPermission();
            if (permissionStatus !== PermissionStatus.GRANTED) {
                throw new Error(this.messageService.getPermissionMessage(permissionStatus));
            }

            // Step 2: Get current location with high accuracy requirement
            console.log('Starting order location validation with high precision...');
            const currentLocation = await this.getCurrentLocation(true); // High accuracy mode

            console.log(`Location obtained: accuracy ${currentLocation.accuracy.toFixed(1)}m`);

            // Step 3: Get shop coordinates for delivery radius validation
            // Import shop coordinates from utils (this is the correct approach for delivery validation)
            const { SHOP_COORDINATES } = await import('../../utils/location');

            // Convert shop coordinates to LocationCoordinates format
            const shopLocation: LocationCoordinates = {
                latitude: SHOP_COORDINATES.latitude,
                longitude: SHOP_COORDINATES.longitude,
                accuracy: 0, // Shop location is exact
                timestamp: Date.now()
            };

            console.log('🏪 Using shop coordinates for delivery validation:', {
                lat: shopLocation.latitude,
                lon: shopLocation.longitude
            });

            // Step 4: Validate current location against shop location (not saved delivery location)
            const validationResult = this.validationEngine.validateLocation(
                currentLocation,
                shopLocation
            );

            console.log(`Validation result: ${validationResult.validationType}, distance: ${validationResult.distance.toFixed(2)}km`);

            // Step 5: Save user location for future reference (but don't use it for validation)
            try {
                const savedLocationData = await this.locationStorage.getStoredLocation();
                if (!savedLocationData) {
                    // First time user - save current location as delivery location for reference
                    await this.saveFirstTimeLocation(currentLocation);
                }
            } catch (error) {
                console.warn('Failed to save location data:', error);
                // Don't fail validation if we can't save location
            }

            // Step 6: Cache validation result
            await this.cacheValidationResult(validationResult, currentLocation, shopLocation);

            return validationResult;

        } catch (error) {
            console.error('Location validation failed:', error);
            throw new Error(
                error instanceof Error ? error.message : 'Failed to validate location'
            );
        }
    }

    /**
     * Requests location permission from user
     * @returns Permission status after request
     */
    async requestLocationPermission(): Promise<PermissionStatus> {
        // If there's already a permission request in progress, wait for it
        if (this.permissionRequestQueue) {
            try {
                return await this.permissionRequestQueue;
            } catch (error) {
                // If the queued request failed, continue with a new request
            }
        }

        // Create new permission request
        this.permissionRequestQueue = this.performPermissionRequest();

        try {
            const result = await this.permissionRequestQueue;
            return result;
        } finally {
            this.permissionRequestQueue = null;
        }
    }

    private async performPermissionRequest(): Promise<PermissionStatus> {
        try {
            return await this.permissionManager.requestPermissionWithRetry(2);
        } catch (error) {
            console.error('Permission request failed:', error);
            return PermissionStatus.DENIED;
        }
    }

    /**
     * Gets current GPS location with retry logic and precision optimization
     * @param requireHighAccuracy Whether to require high accuracy (for order validation)
     * @returns Current location coordinates
     */
    async getCurrentLocation(requireHighAccuracy: boolean = false): Promise<LocationCoordinates> {
        // If there's already a location request in progress, wait for it
        if (this.locationRequestQueue) {
            try {
                return await this.locationRequestQueue;
            } catch (error) {
                // If the queued request failed, continue with a new request
            }
        }

        // Create new location request
        this.locationRequestQueue = this.performLocationRequest(requireHighAccuracy);

        try {
            const result = await this.locationRequestQueue;
            return result;
        } finally {
            this.locationRequestQueue = null;
        }
    }

    private async performLocationRequest(requireHighAccuracy: boolean = false): Promise<LocationCoordinates> {
        try {
            // For order validation, use ultra-precise location
            if (requireHighAccuracy) {
                console.log('Fetching ultra-precise location for order validation...');
                return await this.gpsCoordinator.fetchUltraPreciseLocation();
            }

            // First try quick location fetch for general use
            const quickLocation = await this.gpsCoordinator.fetchLocationQuick();
            if (quickLocation && this.gpsCoordinator.validateAccuracy(quickLocation)) {
                return quickLocation;
            }

            // If quick fetch failed or accuracy is poor, use retry logic with high accuracy
            console.log('Quick location insufficient, fetching high-accuracy location...');
            return await this.gpsCoordinator.retryLocationFetch(RETRY_SETTINGS.MAX_LOCATION_RETRIES);

        } catch (error) {
            console.error('Failed to get current location:', error);

            // Try to use cached location as fallback
            const cachedLocation = await this.locationStorage.getCachedLocation();
            if (cachedLocation) {
                console.warn('Using cached location as fallback');
                return cachedLocation;
            }

            throw new Error(this.messageService.getLocationErrorMessage(error as Error));
        }
    }

    /**
     * Gets stored location data
     * @returns Stored location data or null if not found
     */
    async getStoredLocation(): Promise<LocationData | null> {
        try {
            return await this.locationStorage.getStoredLocation();
        } catch (error) {
            console.error('Failed to get stored location:', error);
            return null;
        }
    }

    /**
     * Updates delivery location coordinates
     * @param coordinates New delivery coordinates
     */
    async updateDeliveryLocation(coordinates: LocationCoordinates): Promise<void> {
        try {
            await this.locationStorage.updateDeliveryAddress(coordinates);
            console.log('Delivery location updated successfully');
        } catch (error) {
            console.error('Failed to update delivery location:', error);
            throw new Error('Failed to update delivery location');
        }
    }

    /**
     * Refreshes current location and re-validates
     * Uses ultra-precise location for best accuracy
     * @returns Fresh location coordinates
     */
    async refreshLocation(): Promise<LocationCoordinates> {
        try {
            // Force fresh location fetch with ultra-high accuracy
            console.log('Refreshing location with ultra-precise mode...');
            const freshLocation = await this.gpsCoordinator.fetchUltraPreciseLocation();

            console.log(`Location refreshed: accuracy ${freshLocation.accuracy.toFixed(1)}m`);
            return freshLocation;

        } catch (error) {
            console.error('Failed to refresh location:', error);
            throw new Error(this.messageService.getLocationErrorMessage(error as Error));
        }
    }

    /**
     * Initializes location service for first-time users
     * @param userId User ID
     * @param deliveryAddress Delivery address string
     * @returns Location data for new user
     */
    async initializeForFirstTimeUser(userId: string, deliveryAddress: string): Promise<LocationData> {
        try {
            // Ensure permissions
            const permissionStatus = await this.ensureLocationPermission();
            if (permissionStatus !== PermissionStatus.GRANTED) {
                throw new Error('Location permission required for first-time setup');
            }

            // Get current location
            const currentLocation = await this.getCurrentLocation();

            // Create and save location data
            const locationData = await this.locationStorage.createLocationData(
                currentLocation,
                userId,
                deliveryAddress
            );

            console.log('First-time user location initialized');
            return locationData;

        } catch (error) {
            console.error('Failed to initialize first-time user:', error);
            throw error;
        }
    }

    /**
     * Gets location service status for debugging
     * @returns Service status information
     */
    async getServiceStatus(): Promise<{
        permissionStatus: PermissionStatus;
        locationServicesEnabled: boolean;
        hasStoredLocation: boolean;
        lastValidationTime: number;
        serviceHealth: 'healthy' | 'degraded' | 'unavailable';
    }> {
        try {
            const permissionDetails = await this.permissionManager.getPermissionDetails();
            const storageStats = await this.locationStorage.getStorageStats();
            const locationServicesWorking = await this.gpsCoordinator.testLocationServices();

            let serviceHealth: 'healthy' | 'degraded' | 'unavailable' = 'healthy';

            if (!permissionDetails.granted || !permissionDetails.locationServicesEnabled) {
                serviceHealth = 'unavailable';
            } else if (!locationServicesWorking || !storageStats.hasUserLocation) {
                serviceHealth = 'degraded';
            }

            return {
                permissionStatus: permissionDetails.status,
                locationServicesEnabled: permissionDetails.locationServicesEnabled,
                hasStoredLocation: storageStats.hasUserLocation,
                lastValidationTime: storageStats.lastFetchTime,
                serviceHealth
            };

        } catch (error) {
            console.error('Failed to get service status:', error);
            return {
                permissionStatus: PermissionStatus.UNDETERMINED,
                locationServicesEnabled: false,
                hasStoredLocation: false,
                lastValidationTime: 0,
                serviceHealth: 'unavailable'
            };
        }
    }

    /**
     * Clears all location data (for logout or reset)
     */
    async clearLocationData(): Promise<void> {
        try {
            await this.locationStorage.clearLocationData();
            console.log('Location data cleared successfully');
        } catch (error) {
            console.error('Failed to clear location data:', error);
            throw new Error('Failed to clear location data');
        }
    }

    /**
     * Ensures location permission is granted
     * @returns Permission status
     */
    private async ensureLocationPermission(): Promise<PermissionStatus> {
        const currentStatus = await this.permissionManager.checkLocationPermission();

        if (currentStatus === PermissionStatus.GRANTED) {
            return currentStatus;
        }

        if (currentStatus === PermissionStatus.NEVER_ASK_AGAIN) {
            return currentStatus; // Cannot request again
        }

        // Request permission
        return await this.permissionManager.requestPermissionWithRetry(2);
    }

    /**
     * Saves location for first-time users
     * @param coordinates Current location coordinates
     */
    private async saveFirstTimeLocation(coordinates: LocationCoordinates): Promise<void> {
        try {
            // For now, use a placeholder user ID and address
            // In real implementation, this would come from auth service
            const locationData: LocationData = {
                id: generateLocationId(),
                userId: 'current_user', // TODO: Get from auth service
                coordinates,
                deliveryAddress: 'Current Location', // TODO: Reverse geocode
                isActive: true,
                createdAt: createTimestamp(),
                updatedAt: createTimestamp()
            };

            await this.locationStorage.saveLocationData(locationData);
        } catch (error) {
            console.error('Failed to save first-time location:', error);
            throw error;
        }
    }

    /**
     * Caches validation result for analytics and debugging
     * @param result Validation result
     * @param currentLocation Current coordinates
     * @param savedLocation Saved coordinates
     */
    private async cacheValidationResult(
        result: LocationValidationResult,
        currentLocation: LocationCoordinates,
        savedLocation: LocationCoordinates
    ): Promise<void> {
        try {
            const validationRecord = {
                id: generateLocationId(),
                currentLocation,
                savedLocation,
                distance: result.distance,
                validationType: result.validationType,
                result: result.isValid,
                timestamp: createTimestamp()
            };

            await this.locationStorage.cacheValidationRecord(validationRecord);
        } catch (error) {
            console.warn('Failed to cache validation result:', error);
            // Don't throw error as this is not critical
        }
    }
}

// Export singleton instance
export const locationService = new LocationService();
