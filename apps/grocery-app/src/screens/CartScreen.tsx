import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

export default function CartScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛒 Shopping Cart</Text>
            <Text style={styles.subtitle}>Your selected items</Text>
            <Text style={styles.comingSoon}>Coming Soon!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.padding,
    },
    title: {
        fontSize: SIZES.fontSize.xlarge,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: SIZES.fontSize.large,
        color: COLORS.textSecondary,
        marginBottom: 30,
        textAlign: 'center',
    },
    comingSoon: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
