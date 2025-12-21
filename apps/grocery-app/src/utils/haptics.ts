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
 * Note: This is a placeholder implementation
 * In a real app, you would use expo-haptics or react-native-haptic-feedback
 */
export const triggerHaptic = (type: HapticFeedbackType = 'light'): void => {
    // Only trigger haptics on supported platforms
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return;
    }

    // In development, just log the haptic feedback
    if (__DEV__) {
        console.log(`🔄 Haptic feedback: ${type}`);
    }

    // TODO: Implement actual haptic feedback
    // Example with expo-haptics:
    // import * as Haptics from 'expo-haptics';
    // 
    // switch (type) {
    //   case 'light':
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    //     break;
    //   case 'medium':
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    //     break;
    //   case 'heavy':
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    //     break;
    //   case 'success':
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    //     break;
    //   case 'warning':
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    //     break;
    //   case 'error':
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    //     break;
    //   case 'selection':
    //     Haptics.selectionAsync();
    //     break;
    // }
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