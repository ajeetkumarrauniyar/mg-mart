import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { User } from '@mg-mart/types';
import { COLORS, SIZES } from '../constants';
import { productService } from '../services/productsService';

export default function HomeScreen() {
    const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

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

    const testApiConnection = async () => {
        setApiStatus('testing');
        try {
            console.log('🧪 Testing API connection...');

            // First, let's try a simple health check or root endpoint
            const response = await fetch('https://mg-mart-server.onrender.com');
            const text = await response.text();
            console.log('🌐 Server response:', text);

            // Now try the products endpoint
            const products = await productService.getProducts({ limit: 1 });
            console.log('✅ API connection successful:', products);
            setApiStatus('success');
            Alert.alert('Success!', `API connected! Found ${products.total} products.`);
        } catch (error: any) {
            console.error('❌ API connection failed:', error);
            setApiStatus('error');

            // Try to get more info about the error
            let errorMessage = 'Unknown error';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message;
                }
                if ('data' in error && typeof error.data === 'string') {
                    // If it's HTML, extract the error message
                    const match = error.data.match(/<pre>(.*?)<\/pre>/);
                    if (match) {
                        errorMessage = match[1];
                    }
                }
            }

            Alert.alert('API Error', `Failed to connect: ${errorMessage}`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>🛒 Welcome to MG Mart</Text>
                <Text style={styles.subtitle}>Your one-stop grocery solution</Text>

                <TouchableOpacity style={styles.button} onPress={handlePress}>
                    <Text style={styles.buttonText}>Hello, {testUser.name}!</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.testButton]}
                    onPress={testApiConnection}
                    disabled={apiStatus === 'testing'}
                >
                    <Text style={styles.buttonText}>
                        {apiStatus === 'testing' ? '🔄 Testing API...' : '🧪 Test API Connection'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>🎉 App Status</Text>
                    <Text style={styles.infoText}>
                        ✅ Navigation Working{'\n'}
                        ✅ Shared Types Working{'\n'}
                        ✅ Home Screen Active{'\n'}
                        {apiStatus === 'success' ? '✅' : apiStatus === 'error' ? '❌' : '⏳'} API Connection{'\n'}
                        ✅ Ready for Development
                    </Text>
                </View>

                <View style={styles.featuresCard}>
                    <Text style={styles.infoTitle}>🚀 Backend Integration</Text>
                    <Text style={styles.infoText}>
                        🌐 Server: mg-mart-server.onrender.com{'\n'}
                        📡 API Status: {apiStatus === 'success' ? 'Connected' : apiStatus === 'error' ? 'Failed' : 'Not tested'}{'\n'}
                        📋 Postman Collection Available{'\n'}
                        🔧 Ready for API Testing
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
    testButton: {
        backgroundColor: '#3182ce',
        marginBottom: 20,
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