// Basic tests for location utilities
import {
    isValidLatitude,
    isValidLongitude,
    validateCoordinates,
    isAccuracyAcceptable,
    formatCoordinates
} from '../utils';
import type { LocationCoordinates } from '../types';

describe('Location Utils', () => {
    describe('isValidLatitude', () => {
        it('should validate correct latitude values', () => {
            expect(isValidLatitude(0)).toBe(true);
            expect(isValidLatitude(45.5)).toBe(true);
            expect(isValidLatitude(-45.5)).toBe(true);
            expect(isValidLatitude(90)).toBe(true);
            expect(isValidLatitude(-90)).toBe(true);
        });

        it('should reject invalid latitude values', () => {
            expect(isValidLatitude(91)).toBe(false);
            expect(isValidLatitude(-91)).toBe(false);
            expect(isValidLatitude(NaN)).toBe(false);
        });
    });

    describe('isValidLongitude', () => {
        it('should validate correct longitude values', () => {
            expect(isValidLongitude(0)).toBe(true);
            expect(isValidLongitude(45.5)).toBe(true);
            expect(isValidLongitude(-45.5)).toBe(true);
            expect(isValidLongitude(180)).toBe(true);
            expect(isValidLongitude(-180)).toBe(true);
        });

        it('should reject invalid longitude values', () => {
            expect(isValidLongitude(181)).toBe(false);
            expect(isValidLongitude(-181)).toBe(false);
            expect(isValidLongitude(NaN)).toBe(false);
        });
    });

    describe('validateCoordinates', () => {
        it('should validate correct coordinates', () => {
            const validCoords: LocationCoordinates = {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 10,
                timestamp: Date.now()
            };
            expect(validateCoordinates(validCoords)).toBe(true);
        });

        it('should reject invalid coordinates', () => {
            const invalidCoords: LocationCoordinates = {
                latitude: 91, // Invalid latitude
                longitude: -74.0060,
                accuracy: 10,
                timestamp: Date.now()
            };
            expect(validateCoordinates(invalidCoords)).toBe(false);
        });
    });

    describe('isAccuracyAcceptable', () => {
        it('should accept good accuracy', () => {
            const coords: LocationCoordinates = {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 50,
                timestamp: Date.now()
            };
            expect(isAccuracyAcceptable(coords, 100)).toBe(true);
        });

        it('should reject poor accuracy', () => {
            const coords: LocationCoordinates = {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 150,
                timestamp: Date.now()
            };
            expect(isAccuracyAcceptable(coords, 100)).toBe(false);
        });
    });

    describe('formatCoordinates', () => {
        it('should format coordinates correctly', () => {
            const coords: LocationCoordinates = {
                latitude: 40.712800,
                longitude: -74.006000,
                accuracy: 10,
                timestamp: Date.now()
            };
            expect(formatCoordinates(coords)).toBe('40.712800, -74.006000');
        });
    });
});