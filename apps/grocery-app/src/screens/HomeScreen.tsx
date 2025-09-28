import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User } from '@mg-mart/types';
import { COLORS, SIZES } from '../constants';

export default function HomeScreen() {
    // Test our shared types
    const testUser: User = {
        userId: '123',
        email: 'test@mgmart.com',
        name: 'Test User',
        phoneNumber: '+1234567890',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const handlePress = () => {
        console.log('Home Screen - User:', testUser.name);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>🛒 Welcome to MG Mart</Text>
                <Text style={styles.subtitle}>Your one-stop grocery solution</Text>

                <TouchableOpacity style={styles.button} onPress={handlePress}>
                    <Text style={styles.buttonText}>Hello, {testUser.name}!</Text>
                </TouchableOpacity>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>🎉 App Status</Text>
                    <Text style={styles.infoText}>
                        ✅ Navigation Working{'\n'}
                        ✅ Shared Types Working{'\n'}
                        ✅ Home Screen Active{'\n'}
                        ✅ Ready for Development
                    </Text>
                </View>

                <View style={styles.featuresCard}>
                    <Text style={styles.infoTitle}>🚀 Coming Soon</Text>
                    <Text style={styles.infoText}>
                        📱 Product Catalog{'\n'}
                        🛍️ Shopping Cart{'\n'}
                        👤 User Profile{'\n'}
                        🔍 Search & Filters
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SIZES.padding,
        paddingTop: 60, // Account for status bar
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
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: SIZES.borderRadius,
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.medium,
        fontWeight: '600',
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: COLORS.successLight,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        borderWidth: 1,
        borderColor: COLORS.success,
        marginBottom: 20,
    },
    featuresCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    infoTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    infoText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
        lineHeight: 24,
    },
});
