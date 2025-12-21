import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { productService } from '../services/productsService';
import { useAuthStore, useProductStore } from '../stores';
import { config } from '../config';
import { Product } from '@mg-mart/types';
import { OptimizedImage } from '../components';

export default function HomeScreen() {
    const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const { user, logout } = useAuthStore();
    const { featuredProducts, fetchFeaturedProducts, isLoading } = useProductStore();

    useEffect(() => {
        // Load featured products on mount
        fetchFeaturedProducts();
    }, [fetchFeaturedProducts]);

    // Get current environment configuration
    const apiBaseUrl = config.environment.API_BASE_URL;
    const appName = config.environment.APP_NAME;
    const isProduction = config.isProduction;
    const currentEnv = isProduction ? 'Production' : 'Development';

    // Extract server domain from API URL
    const serverDomain = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/api.*$/, '');

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        Alert.alert('Success', 'Logged out successfully');
                    },
                },
            ]
        );
    };

    const handlePress = () => {
        console.log('Home Screen - User:', user?.name);
    };

    const testApiConnection = async () => {
        setApiStatus('testing');
        try {
            console.log('🧪 Testing API connection...');

            // First, let's try a simple health check or root endpoint
            const baseUrl = apiBaseUrl.replace(/\/api.*$/, '');
            const response = await fetch(baseUrl);
            const text = await response.text();
            console.log('🌐 Server response:', text);

            // Now try the products endpoint
            const products = await productService.getProducts();
            console.log('✅ API connection successful:', products);
            setApiStatus('success');
            Alert.alert('Success!', `API connected! Found ${products.products?.length || 0} products.`);
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
                    <Text style={styles.buttonText}>Hello, {user?.name || 'Guest'}!</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Text style={styles.buttonText}>🚪 Logout</Text>
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
                <View style={styles.featuresCard}>
                    <Text style={styles.infoTitle}>🚀 Backend Integration</Text>
                    <Text style={styles.infoText}>
                        📱 App: {appName}{'\n'}
                        🌍 Environment: {currentEnv}{'\n'}
                        🌐 Server: {serverDomain}{'\n'}
                        �  API Status: {apiStatus === 'success' ? 'Connected' : apiStatus === 'error' ? 'Failed' : 'Not tested'}{'\n'}
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
    logoutButton: {
        backgroundColor: '#e53e3e',
        marginBottom: 15,
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