import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { useCartStore } from '../stores';
import { useRequireAuth } from '../hooks';
import { addToCartFeedback } from '../utils/haptics';

interface CartQuantityStepperProps {
    productId: string;
    stock: number;
    compact?: boolean;
}

/**
 * Blinkit-style quantity stepper for product cards.
 * - If item is NOT in cart → shows "ADD" button
 * - If item IS in cart → shows [ - qty + ] stepper
 * - Quantity = 0 → reverts to "ADD" button
 */
export const CartQuantityStepper: React.FC<CartQuantityStepperProps> = memo(({
    productId,
    stock,
    compact = false,
}) => {
    const { items, addItem, updateItem, removeItem } = useCartStore();
    const { requireAuth } = useRequireAuth();

    const cartItem = items.find(item => item.productId === productId);
    const quantity = cartItem?.quantity || 0;

    const handleAdd = useCallback(() => {
        if (stock <= 0) return;
        requireAuth(() => {
            addToCartFeedback();
            addItem(productId, 1);
        });
    }, [productId, stock, addItem, requireAuth]);

    const handleIncrease = useCallback(() => {
        if (quantity >= stock) return;
        addToCartFeedback();
        updateItem(productId, quantity + 1);
    }, [productId, quantity, stock, updateItem]);

    const handleDecrease = useCallback(() => {
        if (quantity <= 1) {
            removeItem(productId);
        } else {
            updateItem(productId, quantity - 1);
        }
    }, [productId, quantity, updateItem, removeItem]);

    if (stock <= 0) {
        return (
            <View style={[styles.unavailableButton, compact && styles.compactButton]}>
                <Text style={styles.unavailableText}>Out of Stock</Text>
            </View>
        );
    }

    // Not in cart → show Add button
    if (quantity === 0) {
        return (
            <TouchableOpacity
                style={[styles.addButton, compact && styles.compactButton]}
                onPress={handleAdd}
                activeOpacity={0.7}
            >
                <Text style={styles.addButtonText}>ADD</Text>
                <View style={styles.plusBadge}>
                    <Ionicons name="add" size={10} color={COLORS.primary} />
                </View>
            </TouchableOpacity>
        );
    }

    // In cart → show stepper
    return (
        <View style={[styles.stepperContainer, compact && styles.compactButton]}>
            <TouchableOpacity
                style={styles.stepperButton}
                onPress={handleDecrease}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={quantity <= 1 ? 'trash-outline' : 'remove'}
                    size={compact ? 12 : 14}
                    color={COLORS.white}
                />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
                <Text style={[styles.quantityText, compact && styles.compactQuantityText]}>
                    {quantity}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.stepperButton, quantity >= stock && styles.stepperButtonDisabled]}
                onPress={handleIncrease}
                activeOpacity={0.7}
                disabled={quantity >= stock}
            >
                <Ionicons name="add" size={compact ? 12 : 14} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
});

CartQuantityStepper.displayName = 'CartQuantityStepper';

const styles = StyleSheet.create({
    addButton: {
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: COLORS.primary + '08',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minWidth: 72,
    },
    compactButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 60,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    plusBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    unavailableButton: {
        backgroundColor: COLORS.backgroundDark,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
        minWidth: 72,
    },
    unavailableText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 6,
        overflow: 'hidden',
        minWidth: 72,
    },
    stepperButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperButtonDisabled: {
        opacity: 0.5,
    },
    quantityDisplay: {
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.white,
    },
    compactQuantityText: {
        fontSize: 12,
    },
});

export default CartQuantityStepper;
