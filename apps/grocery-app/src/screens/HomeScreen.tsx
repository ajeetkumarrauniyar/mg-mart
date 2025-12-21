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

    const renderFeaturedProducts = () => {
        if (isLoading && featuredProducts.length === 0) {
            return (
                <View style={styles.featuredSection}>
                    <Text style={styles.sectionTitle}>⭐ Featured Products</Text>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading featured products...</Text>
                    </View>
                </View>
            );
        }

        if (featuredProducts.length === 0) {
            return null;
        }

        return (
            <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>⭐ Featured Products</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                    {featuredProducts.slice(0, 5).map((product: Product) => (
                        <TouchableOpacity key={product.productId} style={styles.featuredCard}>
                            <OptimizedImage
                                source={{ uri: product.imageUrl || 'https://via.placeholder.com/100' }}
                                style={styles.featuredImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.featuredName} numberOfLines={2}>{product.name}</Text>
                            <Text style={styles.featuredPrice}>₹{product.price.toFixed(2)}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
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

                {renderFeaturedProducts()}

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
    featuredSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
    },
    featuredScroll: {
        paddingLeft: 5,
    },
    featuredCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginRight: 15,
        width: 120,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    featuredImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
    },
    featuredName: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 16,
    },
    featuredPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textSecondary,
    },
});