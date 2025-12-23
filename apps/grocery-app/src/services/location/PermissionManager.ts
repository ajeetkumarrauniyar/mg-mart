// Permission management for location services
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import type { PermissionManager as IPermissionManager } from './interfaces';
import { PermissionStatus } from './types';

/**
 * Manages location permissions and device location services
 */
export class PermissionManager implements IPermissionManager {
    /**
     * Checks current location permission status
     * @returns Current permission status
     */
    async checkLocationPermission(): Promise<PermissionStatus> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            return this.mapExpoStatusToPermissionStatus(status);
        } catch (error) {
            console.error('Error checking location permission:', error);
            return PermissionStatus.UNDETERMINED;
        }
    }

    /**
     * Requests location permission from the user
     * @returns Permission status after request
     */
    async requestLocationPermission(): Promise<PermissionStatus> {
        try {
            // First check if we already have permission
            const currentStatus = await this.checkLocationPermission();
            if (currentStatus === PermissionStatus.GRANTED) {
                return PermissionStatus.GRANTED;
            }

            // If permission was previously denied permanently, direct to settings
            if (currentStatus === PermissionStatus.NEVER_ASK_AGAIN) {
                return PermissionStatus.NEVER_ASK_AGAIN;
            }

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            return this.mapExpoStatusToPermissionStatus(status);
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return PermissionStatus.DENIED;
        }
    }

    /**
     * Checks if location services are enabled on the device
     * @returns True if location services are enabled
     */
    async isLocationEnabled(): Promise<boolean> {
        try {
            return await Location.hasServicesEnabledAsync();
        } catch (error) {
            console.error('Error checking location services:', error);
            return false;
        }
    }

    /**
     * Opens device location settings
     */
    openLocationSettings(): void {
        try {
            if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
            } else {
                Linking.openSettings();
            }
        } catch (error) {
            console.error('Error opening location settings:', error);
        }
    }

    /**
     * Checks if the app can request location permission
     * @returns True if permission can be requested
     */
    async canRequestPermission(): Promise<boolean> {
        const status = await this.checkLocationPermission();
        return status !== PermissionStatus.NEVER_ASK_AGAIN;
    }

    /**
     * Gets detailed permission information including rationale
     * @returns Detailed permission information
     */
    async getPermissionDetails(): Promise<{
        status: PermissionStatus;
        canAskAgain: boolean;
        granted: boolean;
        locationServicesEnabled: boolean;
    }> {
        const status = await this.checkLocationPermission();
        const canAskAgain = await this.canRequestPermission();
        const locationServicesEnabled = await this.isLocationEnabled();

        return {
            status,
            canAskAgain,
            granted: status === PermissionStatus.GRANTED,
            locationServicesEnabled,
        };
    }

    /**
     * Handles permission request with retry logic
     * @param maxRetries Maximum number of retry attempts
     * @returns Final permission status
     */
    async requestPermissionWithRetry(maxRetries: number = 2): Promise<PermissionStatus> {
        let attempts = 0;
        let lastStatus = PermissionStatus.UNDETERMINED;

        while (attempts < maxRetries) {
            lastStatus = await this.requestLocationPermission();

            if (lastStatus === PermissionStatus.GRANTED ||
                lastStatus === PermissionStatus.NEVER_ASK_AGAIN) {
                break;
            }

            attempts++;

            // Wait a bit before retrying
            if (attempts < maxRetries) {
                await this.delay(1000);
            }
        }

        return lastStatus;
    }

    /**
     * Maps Expo location permission status to our internal enum
     * @param expoStatus Expo permission status
     * @returns Internal permission status
     */
    private mapExpoStatusToPermissionStatus(expoStatus: Location.PermissionStatus): PermissionStatus {
        switch (expoStatus) {
            case Location.PermissionStatus.GRANTED:
                return PermissionStatus.GRANTED;
            case Location.PermissionStatus.DENIED:
                return PermissionStatus.DENIED;
            case Location.PermissionStatus.UNDETERMINED:
                return PermissionStatus.UNDETERMINED;
            default:
                // Handle any other status as denied
                return PermissionStatus.DENIED;
        }
    }

    /**
     * Utility method to create delays
     * @param ms Milliseconds to delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Monitors permission status changes (for background monitoring)
     * @param callback Callback function called when permission status changes
     * @returns Cleanup function to stop monitoring
     */
    monitorPermissionStatus(callback: (status: PermissionStatus) => void): () => void {
        let isMonitoring = true;
        let lastStatus: PermissionStatus | null = null;

        const checkStatus = async () => {
            if (!isMonitoring) return;

            try {
                const currentStatus = await this.checkLocationPermission();
                if (currentStatus !== lastStatus) {
                    lastStatus = currentStatus;
                    callback(currentStatus);
                }
            } catch (error) {
                console.error('Error monitoring permission status:', error);
            }

            // Check again in 30 seconds
            if (isMonitoring) {
                setTimeout(checkStatus, 30000);
            }
        };

        // Start monitoring
        checkStatus();

        // Return cleanup function
        return () => {
            isMonitoring = false;
        };
    }

    /**
     * Gets user-friendly permission status message
     * @param status Permission status
     * @returns User-friendly message
     */
    getPermissionStatusMessage(status: PermissionStatus): string {
        switch (status) {
            case PermissionStatus.GRANTED:
                return 'Location access granted';
            case PermissionStatus.DENIED:
                return 'Location access denied. Please enable location services for delivery validation.';
            case PermissionStatus.NEVER_ASK_AGAIN:
                return 'Location access permanently denied. Please enable location services in your device settings.';
            case PermissionStatus.UNDETERMINED:
                return 'Location access not determined. Please allow location access for delivery validation.';
            default:
                return 'Unknown location permission status';
        }
    }
}

// Export singleton instance
export const permissionManager = new PermissionManager();