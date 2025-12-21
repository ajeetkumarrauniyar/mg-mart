/**
 * Haptic feedback utilities for better user interaction
 * Provides tactile feedback for various user actions
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

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
 */
export const triggerHaptic = async (type: HapticFeedbackType = 'light'): Promise<void> => {
    // Only trigger haptics on supported platforms
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return;
    }

    try {
        switch (type) {
            case 'light':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'medium':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'heavy':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'success':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'warning':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;
            case 'error':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
            case 'selection':
                await Haptics.selectionAsync();
                break;
        }
    } catch (error) {
        // Silently fail if haptics are not supported
        if (__DEV__) {
            console.warn('Haptic feedback failed:', error);
        }
    }
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