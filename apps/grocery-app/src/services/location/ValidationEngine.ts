// Location validation engine with business logic
import type { ValidationEngine as IValidationEngine } from './interfaces';
import type { LocationCoordinates, LocationValidationResult, LocationAction } from './types';
import { ValidationType } from './types';
import { DistanceCalculator } from './DistanceCalculator';
import { DISTANCE_THRESHOLDS, USER_MESSAGES } from '../../constants';
import { validateCoordinates } from './utils';

/**
 * Core business logic for location validation and decision making
 */
export class ValidationEngine implements IValidationEngine {
    private distanceCalculator: DistanceCalculator;

    constructor() {
        this.distanceCalculator = new DistanceCalculator();
    }

    /**
     * Validates current location against saved delivery location
     * @param currentLocation User's current GPS coordinates
     * @param savedLocation Saved delivery address coordinates
     * @returns Complete validation result with actions
     */
    validateLocation(
        currentLocation: LocationCoordinates,
        savedLocation: LocationCoordinates
    ): LocationValidationResult {
        // Validate input coordinates
        if (!validateCoordinates(currentLocation)) {
            throw new Error('Invalid current location coordinates');
        }
        if (!validateCoordinates(savedLocation)) {
            throw new Error('Invalid saved location coordinates');
        }

        // Calculate distance between locations
        const distance = this.distanceCalculator.calculateDistance(currentLocation, savedLocation);

        // Determine validation type based on distance
        const validationType = this.determineValidationType(distance);

        // Generate appropriate user message
        const message = this.generateUserMessage(validationType);

        // Get suggested actions for this validation result
        const suggestedActions = this.getSuggestedActions(validationType);

        // Determine if order is valid
        const isValid = validationType === ValidationType.APPROVED || validationType === ValidationType.WARNING;

        return {
            isValid,
            distance,
            validationType,
            message,
            suggestedActions
        };
    }

    /**
     * Determines validation type based on distance thresholds
     * @param distance Distance in kilometers
     * @returns Validation type
     */
    determineValidationType(distance: number): ValidationType {
        if (distance <= DISTANCE_THRESHOLDS.APPROVED) {
            return ValidationType.APPROVED;
        } else if (distance <= DISTANCE_THRESHOLDS.WARNING) {
            return ValidationType.WARNING;
        } else {
            return ValidationType.BLOCKED;
        }
    }

    /**
     * Generates user-friendly message based on validation type
     * @param validationType Type of validation result
     * @returns User-friendly message
     */
    generateUserMessage(validationType: ValidationType): string {
        switch (validationType) {
            case ValidationType.APPROVED:
                return USER_MESSAGES.ORDER_APPROVED;
            case ValidationType.WARNING:
                return USER_MESSAGES.ORDER_WARNING;
            case ValidationType.BLOCKED:
                return USER_MESSAGES.ORDER_BLOCKED;
            default:
                return 'Unable to validate your location. Please try again.';
        }
    }

    /**
     * Gets suggested actions based on validation type
     * @param validationType Type of validation result
     * @returns Array of suggested actions
     */
    getSuggestedActions(validationType: ValidationType): LocationAction[] {
        const actions: LocationAction[] = [];

        switch (validationType) {
            case ValidationType.APPROVED:
                // No actions needed for approved orders
                break;

            case ValidationType.WARNING:
                actions.push({
                    type: 'REFRESH_LOCATION',
                    label: 'Refresh Location',
                    handler: () => console.log('Refresh location requested')
                });
                break;

            case ValidationType.BLOCKED:
                actions.push(
                    {
                        type: 'REFRESH_LOCATION',
                        label: 'Refresh Location',
                        handler: () => console.log('Refresh location requested')
                    },
                    {
                        type: 'UPDATE_ADDRESS',
                        label: 'Update Delivery Address',
                        handler: () => console.log('Update address requested')
                    },
                    {
                        type: 'CONTACT_SUPPORT',
                        label: 'Contact Support',
                        handler: () => console.log('Contact support requested')
                    }
                );
                break;
        }

        return actions;
    }

    /**
     * Validates location with GPS accuracy consideration
     * @param currentLocation Current GPS coordinates
     * @param savedLocation Saved delivery coordinates
     * @param accuracyBuffer Buffer in meters to account for GPS accuracy
     * @returns Validation result with accuracy buffer applied
     */
    validateLocationWithAccuracyBuffer(
        currentLocation: LocationCoordinates,
        savedLocation: LocationCoordinates,
        accuracyBuffer: number = 100
    ): LocationValidationResult {
        // Calculate distance with accuracy buffer
        const distance = this.distanceCalculator.calculateDistanceWithBuffer(
            currentLocation,
            savedLocation,
            accuracyBuffer
        );

        const validationType = this.determineValidationType(distance);
        const message = this.generateUserMessage(validationType);
        const suggestedActions = this.getSuggestedActions(validationType);
        const isValid = validationType === ValidationType.APPROVED || validationType === ValidationType.WARNING;

        return {
            isValid,
            distance,
            validationType,
            message,
            suggestedActions
        };
    }

    /**
     * Performs batch validation for multiple locations
     * @param currentLocation Current GPS coordinates
     * @param savedLocations Array of saved delivery locations
     * @returns Array of validation results
     */
    validateMultipleLocations(
        currentLocation: LocationCoordinates,
        savedLocations: LocationCoordinates[]
    ): LocationValidationResult[] {
        return savedLocations.map(savedLocation =>
            this.validateLocation(currentLocation, savedLocation)
        );
    }

    /**
     * Finds the closest valid delivery location
     * @param currentLocation Current GPS coordinates
     * @param savedLocations Array of saved delivery locations
     * @returns Closest valid location result or null if none are valid
     */
    findClosestValidLocation(
        currentLocation: LocationCoordinates,
        savedLocations: LocationCoordinates[]
    ): LocationValidationResult | null {
        const validationResults = this.validateMultipleLocations(currentLocation, savedLocations);

        // Filter for valid locations only
        const validResults = validationResults.filter(result => result.isValid);

        if (validResults.length === 0) {
            return null;
        }

        // Find the closest valid location
        return validResults.reduce((closest, current) =>
            current.distance < closest.distance ? current : closest
        );
    }

    /**
     * Checks if location change is suspicious (potential fraud)
     * @param previousLocation Previous validated location
     * @param currentLocation Current location
     * @param timeElapsedMinutes Time elapsed between locations in minutes
     * @returns True if location change seems suspicious
     */
    isSuspiciousLocationChange(
        previousLocation: LocationCoordinates,
        currentLocation: LocationCoordinates,
        timeElapsedMinutes: number
    ): boolean {
        const distance = this.distanceCalculator.calculateDistance(previousLocation, currentLocation);

        // Calculate speed in km/h
        const speedKmh = (distance / timeElapsedMinutes) * 60;

        // Flag as suspicious if speed exceeds reasonable limits
        const MAX_REASONABLE_SPEED = 200; // km/h (including flights)

        return speedKmh > MAX_REASONABLE_SPEED;
    }

    /**
     * Gets validation summary for analytics
     * @param validationResult Validation result to summarize
     * @returns Summary object for analytics
     */
    getValidationSummary(validationResult: LocationValidationResult): {
        status: string;
        distance: number;
        withinServiceArea: boolean;
        requiresAction: boolean;
        actionCount: number;
    } {
        return {
            status: validationResult.validationType,
            distance: validationResult.distance,
            withinServiceArea: validationResult.isValid,
            requiresAction: validationResult.suggestedActions.length > 0,
            actionCount: validationResult.suggestedActions.length
        };
    }

    /**
     * Creates a detailed validation report
     * @param currentLocation Current GPS coordinates
     * @param savedLocation Saved delivery coordinates
     * @returns Detailed validation report
     */
    createValidationReport(
        currentLocation: LocationCoordinates,
        savedLocation: LocationCoordinates
    ): {
        validation: LocationValidationResult;
        details: {
            currentAccuracy: number;
            savedLocationAge: number;
            distanceThresholds: typeof DISTANCE_THRESHOLDS;
            gpsQuality: string;
        };
    } {
        const validation = this.validateLocation(currentLocation, savedLocation);

        const gpsQuality = currentLocation.accuracy <= 50 ? 'Good' :
            currentLocation.accuracy <= 100 ? 'Fair' : 'Poor';

        const savedLocationAge = Date.now() - savedLocation.timestamp;

        return {
            validation,
            details: {
                currentAccuracy: currentLocation.accuracy,
                savedLocationAge,
                distanceThresholds: DISTANCE_THRESHOLDS,
                gpsQuality
            }
        };
    }
}

// Export singleton instance
export const validationEngine = new ValidationEngine();