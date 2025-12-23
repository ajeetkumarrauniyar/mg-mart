// Utility functions for location data validation and handling
import type { LocationCoordinates } from './types';

/**
 * Validates if latitude is within valid range (-90 to 90)
 */
export function isValidLatitude(latitude: number): boolean {
    return typeof latitude === 'number' &&
        !isNaN(latitude) &&
        latitude >= -90 &&
        latitude <= 90;
}

/**
 * Validates if longitude is within valid range (-180 to 180)
 */
export function isValidLongitude(longitude: number): boolean {
    return typeof longitude === 'number' &&
        !isNaN(longitude) &&
        longitude >= -180 &&
        longitude <= 180;
}

/**
 * Validates if coordinates are within valid geographic ranges
 */
export function validateCoordinates(coordinates: LocationCoordinates): boolean {
    if (!coordinates) return false;

    return isValidLatitude(coordinates.latitude) &&
        isValidLongitude(coordinates.longitude) &&
        typeof coordinates.accuracy === 'number' &&
        coordinates.accuracy >= 0 &&
        typeof coordinates.timestamp === 'number' &&
        coordinates.timestamp > 0;
}

/**
 * Checks if GPS accuracy is acceptable (less than or equal to threshold)
 */
export function isAccuracyAcceptable(coordinates: LocationCoordinates, threshold: number = 100): boolean {
    return coordinates.accuracy <= threshold;
}

/**
 * Checks if location data is recent (within specified minutes)
 */
export function isLocationRecent(coordinates: LocationCoordinates, maxAgeMinutes: number = 5): boolean {
    const now = Date.now();
    const ageInMinutes = (now - coordinates.timestamp) / (1000 * 60);
    return ageInMinutes <= maxAgeMinutes;
}

/**
 * Creates a timestamp for the current moment
 */
export function createTimestamp(): number {
    return Date.now();
}

/**
 * Generates a unique ID for location records
 */
export function generateLocationId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitizes coordinates by rounding to appropriate precision
 */
export function sanitizeCoordinates(coordinates: LocationCoordinates): LocationCoordinates {
    return {
        ...coordinates,
        latitude: Math.round(coordinates.latitude * 1000000) / 1000000, // 6 decimal places
        longitude: Math.round(coordinates.longitude * 1000000) / 1000000, // 6 decimal places
        accuracy: Math.round(coordinates.accuracy * 10) / 10, // 1 decimal place
    };
}

/**
 * Checks for impossible location changes (teleportation detection)
 * Returns true if the change seems suspicious
 */
export function detectTeleportation(
    previousLocation: LocationCoordinates,
    currentLocation: LocationCoordinates,
    maxSpeedKmh: number = 1000 // Maximum reasonable speed (including flights)
): boolean {
    if (!previousLocation || !currentLocation) return false;

    const timeDiffHours = (currentLocation.timestamp - previousLocation.timestamp) / (1000 * 60 * 60);
    if (timeDiffHours <= 0) return false;

    // Calculate distance using simple approximation for speed check
    const latDiff = Math.abs(currentLocation.latitude - previousLocation.latitude);
    const lonDiff = Math.abs(currentLocation.longitude - previousLocation.longitude);
    const approximateDistanceKm = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // Rough km conversion

    const speedKmh = approximateDistanceKm / timeDiffHours;
    return speedKmh > maxSpeedKmh;
}

/**
 * Formats coordinates for display
 */
export function formatCoordinates(coordinates: LocationCoordinates): string {
    return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
}

/**
 * Formats accuracy for display
 */
export function formatAccuracy(accuracy: number): string {
    if (accuracy < 1000) {
        return `${Math.round(accuracy)}m`;
    }
    return `${(accuracy / 1000).toFixed(1)}km`;
}