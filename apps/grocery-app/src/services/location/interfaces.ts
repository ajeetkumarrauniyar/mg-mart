// Service interfaces for the location-based ordering system
import type {
    LocationCoordinates,
    LocationData,
    LocationValidationResult,
    LocationOptions,
    PermissionStatus,
    ServiceAreaValidation,
    ValidationType,
    LocationAction
} from './types';

// Main location service interface
export interface LocationService {
    validateOrderLocation(): Promise<LocationValidationResult>;
    requestLocationPermission(): Promise<PermissionStatus>;
    getCurrentLocation(): Promise<LocationCoordinates>;
    updateDeliveryLocation(coordinates: LocationCoordinates): Promise<void>;
    refreshLocation(): Promise<LocationCoordinates>;
}

// Permission management interface
export interface PermissionManager {
    checkLocationPermission(): Promise<PermissionStatus>;
    requestLocationPermission(): Promise<PermissionStatus>;
    isLocationEnabled(): Promise<boolean>;
    openLocationSettings(): void;
}

// GPS coordinate fetching interface
export interface GPSCoordinator {
    fetchLocation(options: LocationOptions): Promise<LocationCoordinates>;
    validateAccuracy(coordinates: LocationCoordinates): boolean;
    retryLocationFetch(maxRetries: number): Promise<LocationCoordinates>;
}

// Distance calculation interface
export interface DistanceCalculator {
    calculateDistance(
        point1: LocationCoordinates,
        point2: LocationCoordinates
    ): number;

    isWithinServiceArea(
        currentLocation: LocationCoordinates,
        deliveryLocation: LocationCoordinates
    ): ServiceAreaValidation;
}

// Validation engine interface
export interface ValidationEngine {
    validateLocation(
        currentLocation: LocationCoordinates,
        savedLocation: LocationCoordinates
    ): LocationValidationResult;

    determineValidationType(distance: number): ValidationType;
    generateUserMessage(validationType: ValidationType): string;
    getSuggestedActions(validationType: ValidationType): LocationAction[];
}

// Storage interface
export interface LocationStorage {
    saveLocationData(data: LocationData): Promise<void>;
    getStoredLocation(): Promise<LocationData | null>;
    updateDeliveryAddress(coordinates: LocationCoordinates): Promise<void>;
    clearLocationData(): Promise<void>;
}