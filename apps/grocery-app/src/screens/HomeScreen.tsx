import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useAuthStore, useProductStore, useLocationStore, useCartStore } from '../stores';
import { Product } from '@mg-mart/types';
import {
    LocationHeader,
    HomeSearchBar,
    BannerCarousel,
    CategoryGrid,
    QuickAddProductCard
} from '../components';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuthStore();
    const { featuredProducts, fetchFeaturedProducts, isLoading: productsLoading } = useProductStore();
    const {
        locationName,
        isLoading: locationLoading,
        initializeLocation,
    } = useLocationStore();
    const { addItem } = useCartStore();
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchFeaturedProducts();
        initializeLocation();
    }, [fetchFeaturedProducts, initializeLocation]);

    const categories = [
        { id: 1, name: 'Fresh Vegetables', icon: '🥬', color: '#4CAF50' },
        { id: 2, name: 'Fruits', icon: '🍎', color: '#FF9800' },
        { id: 3, name: 'Dairy', icon: '🥛', color: '#2196F3' },
        { id: 4, name: 'Meat & Fish', icon: '🍖', color: '#F44336' },
        { id: 5, name: 'Bakery', icon: '🍞', color: '#795548' },
        { id: 6, name: 'Beverages', icon: '🥤', color: '#9C27B0' },
        { id: 7, name: 'Snacks', icon: '🍿', color: '#FFC107' },
        { id: 8, name: 'Household', icon: '🧼', color: '#00BCD4' },
    ];

    const banners = [
        {
            id: 1,
            tag: 'Flat 40% OFF',
            title: 'Fresh Veggies',
            subtitle: 'Direct from farms',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
            color: '#4CAF50'
        },
        {
            id: 2,
            tag: 'Buy 1 Get 1',
            title: 'Organic Fruits',
            subtitle: 'Best for health',
            image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop',
            color: '#FF9800'
        },
        {
            id: 3,
            tag: 'New Launch',
            title: 'Dairy Fresh',
            subtitle: 'Milk & Eggs now live',
            image: 'https://images.unsplash.com/photo-1550583724-1255818c09d3?w=400&h=400&fit=crop',
            color: '#2196F3'
        }
    ];

    const handleAddToCart = useCallback((product: Product) => {
        if (product.stock <= 0) {
            Alert.alert('Out of Stock', 'This product is currently unavailable');
            return;
        }
        addItem(product.productId, 1);
        Alert.alert('Success', 'Added to cart');
    }, [addItem]);

    const renderSectionHeader = (title: string, onSeeAll: () => void) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <TouchableOpacity onPress={onSeeAll}>
                <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFeaturedProducts = () => {
        if (featuredProducts.length === 0 && !productsLoading) return null;

        return (
            <View style={styles.featuredSection}>
                {renderSectionHeader('Featured Products', () => navigation.navigate('MainTabs', { screen: 'Products' }))}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                >
                    {featuredProducts.slice(0, 10).map((product: Product) => (
                        <QuickAddProductCard
                            key={product.productId}
                            product={product}
                            onPress={() => navigation.navigate('ProductDetail', { productId: product.productId })}
                            onAddPress={() => handleAddToCart(product)}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.stickyHeader}>
                <LocationHeader
                    address={locationName}
                    isLoading={locationLoading}
                    onPress={() => navigation.navigate('LocationSelection')}
                    onProfilePress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                />
                <HomeSearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <BannerCarousel banners={banners} />

                <CategoryGrid
                    categories={categories}
                    onCategoryPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
                />

                {renderFeaturedProducts()}

                <View style={styles.promoSection}>
                    <View style={styles.promoCard}>
                        <View style={styles.promoTextContainer}>
                            <Text style={styles.promoTitle}>Super fast delivery</Text>
                            <Text style={styles.promoSubtitle}>Get your groceries in 10 mins</Text>
                        </View>
                        <Ionicons name="flash" size={32} color="#FFD700" />
                    </View>
                </View>

                {featuredProducts.length > 5 && (
                    <View style={styles.featuredSection}>
                        {renderSectionHeader('Best Sellers', () => navigation.navigate('MainTabs', { screen: 'Products' }))}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredList}
                        >
                            {featuredProducts.slice().reverse().slice(0, 10).map((product: Product) => (
                                <QuickAddProductCard
                                    key={product.productId}
                                    product={product}
                                    onPress={() => navigation.navigate('ProductDetail', { productId: product.productId })}
                                    onAddPress={() => handleAddToCart(product)}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 100 + insets.bottom }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    stickyHeader: {
        zIndex: 10,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    seeAllText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    featuredSection: {
        marginBottom: 24,
    },
    featuredList: {
        paddingLeft: SIZES.padding,
        paddingRight: SIZES.padding - 12,
    },
    promoSection: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
    },
    promoCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    promoTextContainer: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    promoSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
});