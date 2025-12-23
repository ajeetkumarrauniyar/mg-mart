// User messaging service for location-based ordering
import type { LocationCoordinates } from './types';
import { ValidationType, PermissionStatus } from './types';
import { USER_MESSAGES } from './constants';

/**
 * Service for generating user-friendly messages for location scenarios
 */
export class MessageService {
    /**
     * Gets localized message for validation result
     * @param validationType Type of validation result
     * @param distance Distance in kilometers (optional for context)
     * @returns User-friendly message
     */
    getValidationMessage(validationType: ValidationType, distance?: number): string {
        switch (validationType) {
            case ValidationType.APPROVED:
                return USER_MESSAGES.ORDER_APPROVED;

            case ValidationType.WARNING:
                if (distance) {
                    return `You seem to be ${distance.toFixed(1)}km from the store. Please confirm your location is correct.`;
                }
                return USER_MESSAGES.ORDER_WARNING;

            case ValidationType.BLOCKED:
                if (distance) {
                    return `You appear to be ${distance.toFixed(1)}km from our delivery area. Please refresh your location or contact support.`;
                }
                return USER_MESSAGES.ORDER_BLOCKED;

            default:
                return 'Unable to validate your location. Please try again.';
        }
    }

    /**
     * Gets message for permission status
     * @param status Permission status
     * @returns User-friendly permission message
     */
    getPermissionMessage(status: PermissionStatus): string {
        switch (status) {
            case PermissionStatus.GRANTED:
                return 'Location access granted. You can now place orders.';

            case PermissionStatus.DENIED:
                return 'Location access is needed for delivery validation. Please enable location services in your device settings.';

            case PermissionStatus.NEVER_ASK_AGAIN:
                return 'Location access was permanently denied. Please go to your device settings and enable location services for this app.';

            case PermissionStatus.UNDETERMINED:
                return 'We need access to your location to validate delivery eligibility. This helps ensure your orders can be delivered successfully.';

            default:
                return 'Location permission status unknown. Please try again.';
        }
    }

    /**
     * Gets message for GPS accuracy status
     * @param accuracy GPS accuracy in meters
     * @returns User-friendly accuracy message
     */
    getAccuracyMessage(accuracy: number): string {
        if (accuracy <= 10) {
            return 'Excellent location accuracy detected.';
        } else if (accuracy <= 50) {
            return 'Good location accuracy detected.';
        } else if (accuracy <= 100) {
            return 'Acceptable location accuracy detected.';
        } else if (accuracy <= 500) {
            return 'Location accuracy is poor. Trying to improve...';
        } else {
            return 'Location accuracy is very poor. Please ensure you have a clear view of the sky and try again.';
        }
    }

    /**
     * Gets loading message for location fetching
     * @param attempt Current attempt number
     * @param maxAttempts Maximum attempts
     * @returns Loading message
     */
    getLocationFetchingMessage(attempt: number = 1, maxAttempts: number = 3): string {
        if (attempt === 1) {
            return USER_MESSAGES.LOCATION_FETCHING;
        } else if (attempt <= maxAttempts) {
            return `Improving location accuracy... (${attempt}/${maxAttempts})`;
        } else {
            return 'Having trouble getting your location. Please check your GPS settings.';
        }
    }

    /**
     * Gets error message for location failures
     * @param error Error type or message
     * @returns User-friendly error message
     */
    getLocationErrorMessage(error: string | Error): string {
        const errorMessage = error instanceof Error ? error.message : error;

        if (errorMessage.includes('timeout')) {
            return 'Location request timed out. Please ensure GPS is enabled and try again.';
        } else if (errorMessage.includes('permission')) {
            return 'Location permission is required. Please enable location services.';
        } else if (errorMessage.includes('unavailable')) {
            return 'Location services are not available. Please check your device settings.';
        } else if (errorMessage.includes('accuracy')) {
            return 'Unable to get accurate location. Please move to an area with better GPS signal.';
        } else {
            return 'Unable to get your location. Please check your GPS settings and try again.';
        }
    }

    /**
     * Gets success message for location operations
     * @param operation Type of operation completed
     * @returns Success message
     */
    getSuccessMessage(operation: 'refresh' | 'update' | 'validation'): string {
        switch (operation) {
            case 'refresh':
                return USER_MESSAGES.LOCATION_REFRESH_SUCCESS;
            case 'update':
                return 'Delivery location updated successfully.';
            case 'validation':
                return 'Location validated successfully. You can proceed with your order.';
            default:
                return 'Operation completed successfully.';
        }
    }

    /**
     * Gets contextual help message
     * @param context Current context or screen
     * @returns Helpful message for the user
     */
    getHelpMessage(context: 'permission' | 'accuracy' | 'blocked' | 'general'): string {
        switch (context) {
            case 'permission':
                return 'Location access helps us verify that you are within our delivery area. This ensures your order can be delivered successfully.';

            case 'accuracy':
                return 'For best results, ensure you have a clear view of the sky and GPS is enabled. Location accuracy may take a few moments to improve.';

            case 'blocked':
                return 'If you believe you are within our delivery area, try refreshing your location or contact our support team for assistance.';

            case 'general':
                return 'We use your location to ensure orders are placed from within our delivery area. Your location data is kept secure and private.';

            default:
                return 'Need help? Contact our support team for assistance with location-related issues.';
        }
    }

    /**
     * Gets action button text
     * @param actionType Type of action
     * @returns Button text
     */
    getActionButtonText(actionType: 'refresh' | 'update' | 'support' | 'settings' | 'retry'): string {
        switch (actionType) {
            case 'refresh':
                return 'Refresh Location';
            case 'update':
                return 'Update Address';
            case 'support':
                return 'Contact Support';
            case 'settings':
                return 'Open Settings';
            case 'retry':
                return 'Try Again';
            default:
                return 'Continue';
        }
    }

    /**
     * Gets formatted distance message
     * @param distance Distance in kilometers
     * @returns Formatted distance string
     */
    getDistanceMessage(distance: number): string {
        if (distance < 0.1) {
            return 'You are very close to the store';
        } else if (distance < 1) {
            return `You are ${(distance * 1000).toFixed(0)}m from the store`;
        } else {
            return `You are ${distance.toFixed(1)}km from the store`;
        }
    }

    /**
     * Gets delivery area information message
     * @returns Information about delivery area
     */
    getDeliveryAreaInfo(): string {
        return 'We deliver within a 5km radius of our store. Orders between 5-7km may require confirmation.';
    }

    /**
     * Gets privacy information message
     * @returns Privacy information about location usage
     */
    getPrivacyMessage(): string {
        return 'Your location is only used for delivery validation and is not stored permanently. We respect your privacy and follow all data protection guidelines.';
    }

    /**
     * Creates a comprehensive message object for UI display
     * @param validationType Validation result type
     * @param distance Distance in kilometers
     * @param accuracy GPS accuracy in meters
     * @returns Complete message object
     */
    createMessageObject(
        validationType: ValidationType,
        distance: number,
        accuracy: number
    ): {
        title: string;
        message: string;
        distanceInfo: string;
        accuracyInfo: string;
        helpText: string;
        actionButtons: string[];
    } {
        const title = validationType === ValidationType.APPROVED ? 'Order Approved' :
            validationType === ValidationType.WARNING ? 'Please Confirm' :
                'Order Cannot Be Placed';

        const message = this.getValidationMessage(validationType, distance);
        const distanceInfo = this.getDistanceMessage(distance);
        const accuracyInfo = this.getAccuracyMessage(accuracy);

        const helpText = validationType === ValidationType.BLOCKED ?
            this.getHelpMessage('blocked') :
            this.getHelpMessage('general');

        const actionButtons = validationType === ValidationType.APPROVED ? [] :
            validationType === ValidationType.WARNING ? ['refresh'] :
                ['refresh', 'update', 'support'];

        return {
            title,
            message,
            distanceInfo,
            accuracyInfo,
            helpText,
            actionButtons: actionButtons.map(action => this.getActionButtonText(action as any))
        };
    }
}

// Export singleton instance
export const messageService = new MessageService();