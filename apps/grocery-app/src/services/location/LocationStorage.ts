// Location data storage with caching and persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationStorage as ILocationStorage } from './interfaces';
import type { LocationData, LocationCoordinates, ValidationRecord, LocalLocationStorage } from './types';
import { STORAGE_KEYS, CACHE_SETTINGS } from '../../constants';
import { generateLocationId, createTimestamp, isLocationRecent } from './utils';

/**
 * Manages local storage and caching of location data
 */
export class LocationStorage implements ILocationStorage {
    private memoryCache: {
        userLocation: LocationData | null;
        validationCache: ValidationRecord[];
        lastFetch: number;
    } = {
            userLocation: null,
            validationCache: [],
            lastFetch: 0,
        };

    /**
     * Saves location data to both memory cache and persistent storage
     * @param data Location data to save
     */
    async saveLocationData(data: LocationData): Promise<void> {
        try {
            // Update memory cache
            this.memoryCache.userLocation = data;
            this.memoryCache.lastFetch = createTimestamp();

            // Save to persistent storage
            await AsyncStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(data));
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION_FETCH, this.memoryCache.lastFetch.toString());

            console.log('Location data saved successfully');
        } catch (error) {
            console.error('Error saving location data:', error);
            throw new Error('Failed to save location data');
        }
    }

    /**
     * Retrieves stored location data, preferring memory cache
     * @returns Stored location data or null if not found
     */
    async getStoredLocation(): Promise<LocationData | null> {
        try {
            // Check memory cache first
            if (this.memoryCache.userLocation && this.isMemoryCacheValid()) {
                return this.memoryCache.userLocation;
            }

            // Load from persistent storage
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOCATION);
            if (!storedData) {
                return null;
            }

            const locationData: LocationData = JSON.parse(storedData);

            // Update memory cache
            this.memoryCache.userLocation = locationData;

            return locationData;
        } catch (error) {
            console.error('Error retrieving stored location:', error);
            return null;
        }
    }

    /**
     * Updates delivery address coordinates
     * @param coordinates New delivery coordinates
     */
    async updateDeliveryAddress(coordinates: LocationCoordinates): Promise<void> {
        try {
            const existingData = await this.getStoredLocation();

            if (!existingData) {
                throw new Error('No existing location data to update');
            }

            const updatedData: LocationData = {
                ...existingData,
                coordinates,
                updatedAt: createTimestamp(),
            };

            await this.saveLocationData(updatedData);
        } catch (error) {
            console.error('Error updating delivery address:', error);
            throw new Error('Failed to update delivery address');
        }
    }

    /**
     * Clears all location data from storage and cache
     */
    async clearLocationData(): Promise<void> {
        try {
            // Clear memory cache
            this.memoryCache.userLocation = null;
            this.memoryCache.validationCache = [];
            this.memoryCache.lastFetch = 0;

            // Clear persistent storage
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.USER_LOCATION,
                STORAGE_KEYS.VALIDATION_CACHE,
                STORAGE_KEYS.LAST_LOCATION_FETCH,
            ]);

            console.log('Location data cleared successfully');
        } catch (error) {
            console.error('Error clearing location data:', error);
            throw new Error('Failed to clear location data');
        }
    }

    /**
     * Caches a validation record
     * @param record Validation record to cache
     */
    async cacheValidationRecord(record: ValidationRecord): Promise<void> {
        try {
            // Add to memory cache
            this.memoryCache.validationCache.unshift(record);

            // Limit cache size
            if (this.memoryCache.validationCache.length > CACHE_SETTINGS.VALIDATION_CACHE_SIZE) {
                this.memoryCache.validationCache = this.memoryCache.validationCache.slice(0, CACHE_SETTINGS.VALIDATION_CACHE_SIZE);
            }

            // Save to persistent storage
            await AsyncStorage.setItem(
                STORAGE_KEYS.VALIDATION_CACHE,
                JSON.stringify(this.memoryCache.validationCache)
            );
        } catch (error) {
            console.error('Error caching validation record:', error);
        }
    }

    /**
     * Retrieves cached validation records
     * @param limit Maximum number of records to return
     * @returns Array of validation records
     */
    async getCachedValidationRecords(limit: number = 10): Promise<ValidationRecord[]> {
        try {
            // Check memory cache first
            if (this.memoryCache.validationCache.length > 0) {
                return this.memoryCache.validationCache.slice(0, limit);
            }

            // Load from persistent storage
            const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.VALIDATION_CACHE);
            if (!cachedData) {
                return [];
            }

            const records: ValidationRecord[] = JSON.parse(cachedData);
            this.memoryCache.validationCache = records;

            return records.slice(0, limit);
        } catch (error) {
            console.error('Error retrieving cached validation records:', error);
            return [];
        }
    }

    /**
     * Gets cached location if it's still valid (recent)
     * @returns Cached location coordinates or null
     */
    async getCachedLocation(): Promise<LocationCoordinates | null> {
        try {
            const locationData = await this.getStoredLocation();
            if (!locationData) {
                return null;
            }

            // Check if location is still recent
            if (isLocationRecent(locationData.coordinates, 5)) { // 5 minutes
                return locationData.coordinates;
            }

            return null;
        } catch (error) {
            console.error('Error getting cached location:', error);
            return null;
        }
    }

    /**
     * Creates a new location data record
     * @param coordinates Location coordinates
     * @param userId User ID
     * @param deliveryAddress Delivery address string
     * @returns New location data record
     */
    async createLocationData(
        coordinates: LocationCoordinates,
        userId: string,
        deliveryAddress: string
    ): Promise<LocationData> {
        const locationData: LocationData = {
            id: generateLocationId(),
            userId,
            coordinates,
            deliveryAddress,
            isActive: true,
            createdAt: createTimestamp(),
            updatedAt: createTimestamp(),
        };

        await this.saveLocationData(locationData);
        return locationData;
    }

    /**
     * Gets storage statistics for debugging
     * @returns Storage usage statistics
     */
    async getStorageStats(): Promise<{
        hasUserLocation: boolean;
        validationCacheSize: number;
        lastFetchTime: number;
        cacheAge: number;
    }> {
        try {
            const userLocation = await this.getStoredLocation();
            const validationCache = await this.getCachedValidationRecords();
            const lastFetchStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION_FETCH);
            const lastFetchTime = lastFetchStr ? parseInt(lastFetchStr, 10) : 0;
            const cacheAge = Date.now() - lastFetchTime;

            return {
                hasUserLocation: userLocation !== null,
                validationCacheSize: validationCache.length,
                lastFetchTime,
                cacheAge,
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return {
                hasUserLocation: false,
                validationCacheSize: 0,
                lastFetchTime: 0,
                cacheAge: 0,
            };
        }
    }

    /**
     * Exports all location data for backup or debugging
     * @returns Complete location storage data
     */
    async exportLocationData(): Promise<LocalLocationStorage> {
        try {
            const userLocation = await this.getStoredLocation();
            const validationCache = await this.getCachedValidationRecords(CACHE_SETTINGS.VALIDATION_CACHE_SIZE);
            const permissionStatusStr = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION_STATUS);
            const lastFetchStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION_FETCH);

            return {
                userLocation,
                validationCache,
                permissionStatus: permissionStatusStr as any || 'undetermined',
                lastLocationFetch: lastFetchStr ? parseInt(lastFetchStr, 10) : 0,
            };
        } catch (error) {
            console.error('Error exporting location data:', error);
            throw new Error('Failed to export location data');
        }
    }

    /**
     * Imports location data from backup
     * @param data Location storage data to import
     */
    async importLocationData(data: LocalLocationStorage): Promise<void> {
        try {
            if (data.userLocation) {
                await this.saveLocationData(data.userLocation);
            }

            if (data.validationCache.length > 0) {
                this.memoryCache.validationCache = data.validationCache;
                await AsyncStorage.setItem(STORAGE_KEYS.VALIDATION_CACHE, JSON.stringify(data.validationCache));
            }

            if (data.permissionStatus) {
                await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_STATUS, data.permissionStatus);
            }

            if (data.lastLocationFetch) {
                await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION_FETCH, data.lastLocationFetch.toString());
            }

            console.log('Location data imported successfully');
        } catch (error) {
            console.error('Error importing location data:', error);
            throw new Error('Failed to import location data');
        }
    }

    /**
     * Checks if memory cache is still valid
     * @returns True if memory cache is valid
     */
    private isMemoryCacheValid(): boolean {
        const cacheAge = Date.now() - this.memoryCache.lastFetch;
        return cacheAge < CACHE_SETTINGS.LOCATION_MAX_AGE;
    }

    /**
     * Cleans up old validation records
     */
    private async cleanupValidationCache(): Promise<void> {
        try {
            const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

            this.memoryCache.validationCache = this.memoryCache.validationCache.filter(
                record => record.timestamp > cutoffTime
            );

            await AsyncStorage.setItem(
                STORAGE_KEYS.VALIDATION_CACHE,
                JSON.stringify(this.memoryCache.validationCache)
            );
        } catch (error) {
            console.error('Error cleaning up validation cache:', error);
        }
    }
}

// Export singleton instance
export const locationStorage = new LocationStorage();