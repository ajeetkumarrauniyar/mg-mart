// Distance calculation implementation using Haversine formula
import type { LocationCoordinates, ServiceAreaValidation } from './types';
import type { DistanceCalculator as IDistanceCalculator } from './interfaces';
import { DISTANCE_THRESHOLDS } from '../../constants';
import { validateCoordinates } from './utils';

/**
 * Implementation of distance calculation using the Haversine formula
 * for calculating great-circle distances between two points on Earth
 */
export class DistanceCalculator implements IDistanceCalculator {
    private static readonly EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

    /**
     * Calculates the distance between two geographic points using the Haversine formula
     * @param point1 First coordinate point
     * @param point2 Second coordinate point
     * @returns Distance in kilometers
     */
    calculateDistance(point1: LocationCoordinates, point2: LocationCoordinates): number {
        // Debug logging to see what coordinates we're getting
        console.log('🔍 Distance calculation input:', {
            point1: {
                lat: point1.latitude,
                lon: point1.longitude,
                acc: point1.accuracy,
                timestamp: point1.timestamp
            },
            point2: {
                lat: point2.latitude,
                lon: point2.longitude,
                acc: point2.accuracy,
                timestamp: point2.timestamp
            }
        });

        // Validate input coordinates
        if (!validateCoordinates(point1) || !validateCoordinates(point2)) {
            console.error('❌ Coordinate validation failed:', { point1, point2 });
            throw new Error('Invalid coordinates provided for distance calculation');
        }

        // Additional null/undefined checks
        if (point1.latitude == null || point1.longitude == null ||
            point2.latitude == null || point2.longitude == null) {
            console.error('❌ Null coordinates detected:', { point1, point2 });
            throw new Error('Coordinates cannot be null or undefined');
        }

        // Check for NaN values
        if (isNaN(point1.latitude) || isNaN(point1.longitude) ||
            isNaN(point2.latitude) || isNaN(point2.longitude)) {
            console.error('❌ NaN coordinates detected:', { point1, point2 });
            throw new Error('Coordinates cannot be NaN');
        }

        // Convert latitude and longitude from degrees to radians
        const lat1Rad = this.degreesToRadians(point1.latitude);
        const lat2Rad = this.degreesToRadians(point2.latitude);
        const deltaLatRad = this.degreesToRadians(point2.latitude - point1.latitude);
        const deltaLonRad = this.degreesToRadians(point2.longitude - point1.longitude);

        // Check for NaN after conversion
        if (isNaN(lat1Rad) || isNaN(lat2Rad) || isNaN(deltaLatRad) || isNaN(deltaLonRad)) {
            console.error('❌ NaN after radian conversion:', {
                lat1Rad, lat2Rad, deltaLatRad, deltaLonRad,
                originalCoords: { point1, point2 }
            });
            throw new Error('Invalid coordinate conversion resulted in NaN');
        }

        // Haversine formula
        const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Distance in kilometers
        const distance = DistanceCalculator.EARTH_RADIUS_KM * c;

        // Check for NaN result
        if (isNaN(distance)) {
            console.error('❌ Distance calculation resulted in NaN:', {
                point1,
                point2,
                lat1Rad,
                lat2Rad,
                deltaLatRad,
                deltaLonRad,
                a,
                c,
                earthRadius: DistanceCalculator.EARTH_RADIUS_KM
            });
            throw new Error('Distance calculation failed - result is NaN');
        }

        // Round to 3 decimal places for precision
        const finalDistance = Math.round(distance * 1000) / 1000;

        console.log(`✅ Distance calculated: ${finalDistance}km`);
        return finalDistance;
    }

    /**
     * Determines if current location is within service area relative to delivery location
     * @param currentLocation User's current GPS coordinates
     * @param deliveryLocation Saved delivery address coordinates
     * @returns Service area validation result
     */
    isWithinServiceArea(
        currentLocation: LocationCoordinates,
        deliveryLocation: LocationCoordinates
    ): ServiceAreaValidation {
        const distance = this.calculateDistance(currentLocation, deliveryLocation);

        let status: 'WITHIN_AREA' | 'WARNING_ZONE' | 'OUTSIDE_AREA';
        let threshold: number;

        if (distance <= DISTANCE_THRESHOLDS.APPROVED) {
            status = 'WITHIN_AREA';
            threshold = DISTANCE_THRESHOLDS.APPROVED;
        } else if (distance <= DISTANCE_THRESHOLDS.WARNING) {
            status = 'WARNING_ZONE';
            threshold = DISTANCE_THRESHOLDS.WARNING;
        } else {
            status = 'OUTSIDE_AREA';
            threshold = DISTANCE_THRESHOLDS.BLOCKED;
        }

        return {
            distance,
            status,
            threshold
        };
    }

    /**
     * Calculates distance with GPS accuracy buffer consideration
     * Adds a small buffer to account for GPS drift and measurement errors
     * @param point1 First coordinate point
     * @param point2 Second coordinate point
     * @param bufferMeters Buffer in meters to account for GPS accuracy
     * @returns Distance in kilometers with buffer applied
     */
    calculateDistanceWithBuffer(
        point1: LocationCoordinates,
        point2: LocationCoordinates,
        bufferMeters: number = 100
    ): number {
        const baseDistance = this.calculateDistance(point1, point2);
        const bufferKm = bufferMeters / 1000;

        // Subtract buffer to be more lenient (give benefit of doubt to user)
        return Math.max(0, baseDistance - bufferKm);
    }

    /**
     * Validates if two coordinates represent the same location within accuracy tolerance
     * @param point1 First coordinate point
     * @param point2 Second coordinate point
     * @param toleranceMeters Tolerance in meters (default 50m)
     * @returns True if coordinates are within tolerance
     */
    isSameLocation(
        point1: LocationCoordinates,
        point2: LocationCoordinates,
        toleranceMeters: number = 50
    ): boolean {
        const distance = this.calculateDistance(point1, point2);
        const toleranceKm = toleranceMeters / 1000;
        return distance <= toleranceKm;
    }

    /**
     * Handles edge cases for coordinates near poles or international date line
     * @param coordinates Coordinates to validate
     * @returns True if coordinates are in a problematic region
     */
    isProblematicLocation(coordinates: LocationCoordinates): boolean {
        // Near poles (within 1 degree)
        if (Math.abs(coordinates.latitude) > 89) {
            return true;
        }

        // Near international date line (within 1 degree of ±180)
        if (Math.abs(Math.abs(coordinates.longitude) - 180) < 1) {
            return true;
        }

        return false;
    }

    /**
     * Converts degrees to radians
     * @param degrees Angle in degrees
     * @returns Angle in radians
     */
    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Converts radians to degrees
     * @param radians Angle in radians
     * @returns Angle in degrees
     */
    private radiansToDegrees(radians: number): number {
        return radians * (180 / Math.PI);
    }

    /**
     * Calculates the bearing (direction) from point1 to point2
     * @param point1 Starting point
     * @param point2 Ending point
     * @returns Bearing in degrees (0-360)
     */
    calculateBearing(point1: LocationCoordinates, point2: LocationCoordinates): number {
        const lat1Rad = this.degreesToRadians(point1.latitude);
        const lat2Rad = this.degreesToRadians(point2.latitude);
        const deltaLonRad = this.degreesToRadians(point2.longitude - point1.longitude);

        const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);

        const bearingRad = Math.atan2(y, x);
        const bearingDeg = this.radiansToDegrees(bearingRad);

        // Normalize to 0-360 degrees
        return (bearingDeg + 360) % 360;
    }
}

// Export singleton instance
export const distanceCalculator = new DistanceCalculator();