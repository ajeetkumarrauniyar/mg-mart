/**
 * Haptic feedback utilities for better user interaction
 * Provides tactile feedback for various user actions
 */

import { Platform } from 'react-native';

// Define haptic feedback types
export type HapticFeedbackType =
    | 'light'
    | 'medium'
    | 'heavy'
    | 'success'
    | 'warning'
    | 'error'
    | 'selection';

/**
 * Trigger haptic feedback
 * Note: This is a placeholder implementation for now
 * In production, you would implement actual haptic feedback
 */
export const triggerHaptic = (type: HapticFeedbackType = 'light'): void => {
    // Only trigger haptics on supported platforms
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return;
    }

    // For now, just log in development
    if (__DEV__) {
        console.log(`🔄 Haptic feedback: ${type}`);
    }

    // TODO: Implement actual haptic feedback when expo-haptics is properly configured
    // This prevents bundling issues while maintaining the API
};

/**
 * Haptic feedback for button presses
 */
export const buttonPress = (): void => {
    triggerHaptic('light');
};

/**
 * Haptic feedback for successful actions
 */
export const successFeedback = (): void => {
    triggerHaptic('success');
};

/**
 * Haptic feedback for errors
 */
export const errorFeedback = (): void => {
    triggerHaptic('error');
};

/**
 * Haptic feedback for selections
 */
export const selectionFeedback = (): void => {
    triggerHaptic('selection');
};

/**
 * Haptic feedback for adding items to cart
 */
export const addToCartFeedback = (): void => {
    triggerHaptic('medium');
};

/**
 * Haptic feedback for removing items
 */
export const removeItemFeedback = (): void => {
    triggerHaptic('warning');
};

export default {
    triggerHaptic,
    buttonPress,
    successFeedback,
    errorFeedback,
    selectionFeedback,
    addToCartFeedback,
    removeItemFeedback,
};