import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';

interface QuantityStepperProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    isLoading?: boolean;
    minValue?: number;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
    quantity,
    onIncrease,
    onDecrease,
    isLoading = false,
    minValue = 1,
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, quantity <= minValue && styles.buttonDisabled]}
                onPress={onDecrease}
                disabled={isLoading}
            >
                <Ionicons
                    name={quantity <= minValue ? 'trash-outline' : 'remove'}
                    size={16}
                    color={quantity <= minValue ? COLORS.error : COLORS.text}
                />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Text style={styles.quantityText}>{quantity}</Text>
                )}
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={onIncrease}
                disabled={isLoading}
            >
                <Ionicons name="add" size={16} color={COLORS.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    button: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    buttonDisabled: {
        opacity: 0.8,
    },
    quantityDisplay: {
        minWidth: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
});

export default QuantityStepper;
