import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    StatusBar,
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { isDevelopment } from '../config/environment';
import { useAuthStore, useProductStore, useLocationStore } from '../stores';
import { Product } from '@mg-mart/types';
import { OptimizedImage } from '../components';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user, logout } = useAuthStore();
    const { featuredProducts, fetchFeaturedProducts, isLoading } = useProductStore();
    const { locationName, isLoading: locationLoading, initializeLocation, refreshLocation, getCurrentLocationName, currentLocation, error } = useLocationStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchFeaturedProducts();
        initializeLocation(); // Initialize location on component mount
    }, [fetchFeaturedProducts, initializeLocation]);

    const categories = [
        { id: 1, name: 'Fresh Vegetables', icon: '🥬', color: '#4CAF50' },
        { id: 2, name: 'Fruits', icon: '🍎', color: '#FF9800' },
        { id: 3, name: 'Dairy', icon: '🥛', color: '#2196F3' },
        { id: 4, name: 'Meat & Fish', icon: '🍖', color: '#F44336' },
        { id: 5, name: 'Bakery', icon: '🍞', color: '#795548' },
        { id: 6, name: 'Beverages', icon: '🥤', color: '#9C27B0' },
    ];

    const offers = [
        {
            id: 1,
            title: 'Fresh Vegetables',
            subtitle: 'Get up to 40% OFF',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop',
            color: '#E8F5E8'
        },
        {
            id: 2,
            title: 'Organic Fruits',
            subtitle: 'Buy 2 Get 1 Free',
            image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=200&fit=crop',
            color: '#FFF3E0'
        }
    ];

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity
                    style={styles.locationContainer}
                    onPress={() => navigation.navigate('LocationSelection')}
                >
                    <Ionicons name="location" size={16} color={COLORS.primary} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {locationLoading ? 'Getting location...' : locationName}
                    </Text>
                    {locationLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => setShowProfileMenu(true)}
                >
                    <Ionicons name="person-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Store"
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const renderOffers = () => (
        <View style={styles.offersSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {offers.map((offer) => (
                    <TouchableOpacity key={offer.id} style={[styles.offerCard, { backgroundColor: offer.color }]}>
                        <View style={styles.offerContent}>
                            <Text style={styles.offerTitle}>{offer.title}</Text>
                            <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                        </View>
                        <OptimizedImage
                            source={{ uri: offer.image }}
                            style={styles.offerImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderCategories = () => (
        <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.categoryCard}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                            <Text style={styles.categoryEmoji}>{category.icon}</Text>
                        </View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderFeaturedProducts = () => {
        if (featuredProducts.length === 0) return null;

        return (
            <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Products</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {featuredProducts.slice(0, 8).map((product: Product) => (
                        <TouchableOpacity
                            key={product.productId}
                            style={styles.productCard}
                            onPress={() => navigation.navigate('ProductDetail', { productId: product.productId })}
                        >
                            <OptimizedImage
                                source={{ uri: product.imageUrl || 'https://via.placeholder.com/120x120' }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                                <Text style={styles.productPrice}>₹{product.price.toFixed(2)}</Text>
                                <TouchableOpacity style={styles.addButton}>
                                    <Ionicons name="add" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const handleLogout = () => {
        setShowProfileMenu(false);
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

    const renderProfileMenu = () => (
        <Modal
            visible={showProfileMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowProfileMenu(false)}
        >
            <TouchableOpacity
                style={[styles.modalOverlay, { paddingTop: insets.top + 10 }]}
                activeOpacity={1}
                onPress={() => setShowProfileMenu(false)}
            >
                <View style={styles.profileMenu}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setShowProfileMenu(false);
                            navigation.navigate('MainTabs', { screen: 'Profile' });
                        }}
                    >
                        <Ionicons name="person-outline" size={20} color={COLORS.text} />
                        <Text style={styles.menuText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setShowProfileMenu(false);
                            getCurrentLocationName();
                        }}
                    >
                        <Ionicons name="locate-outline" size={20} color={COLORS.text} />
                        <Text style={styles.menuText}>Get Current Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setShowProfileMenu(false);
                            refreshLocation();
                        }}
                    >
                        <Ionicons name="refresh-outline" size={20} color={COLORS.text} />
                        <Text style={styles.menuText}>Refresh Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setShowProfileMenu(false);
                            navigation.navigate('LocationSelection');
                        }}
                    >
                        <Ionicons name="location-outline" size={20} color={COLORS.text} />
                        <Text style={styles.menuText}>Change Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                        <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={false} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderOffers()}
                {renderCategories()}
                {renderFeaturedProducts()}
                {isDevelopment && (
                    <View style={styles.debugSection}>
                        <Text style={styles.debugTitle}>🔧 Debug Info</Text>
                        <Text style={styles.debugText}>Location: {locationName}</Text>
                        {currentLocation && (
                            <Text style={styles.debugText}>
                                Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                            </Text>
                        )}
                        {error && <Text style={styles.debugError}>Error: {error}</Text>}
                        <TouchableOpacity
                            style={styles.debugButton}
                            onPress={getCurrentLocationName}
                        >
                            <Text style={styles.debugButtonText}>Force Location Update</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={[styles.bottomSpacing, { height: 100 + insets.bottom }]} />
            </ScrollView>
            {renderProfileMenu()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.borderRadius,
        maxWidth: '70%',
    },
    locationText: {
        fontSize: SIZES.fontSize.small,
        fontWeight: SIZES.fontWeight.medium,
        color: COLORS.text,
        marginLeft: 4,
        marginRight: 4,
        flex: 1,
    },
    profileButton: {
        padding: 4,
    },
    greeting: {
        fontSize: SIZES.fontSize.large,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    userName: {
        fontSize: SIZES.fontSize.xxlarge,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
        borderRadius: SIZES.borderRadiusLarge,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
    },
    offersSection: {
        paddingLeft: SIZES.padding,
        marginBottom: 24,
    },
    offerCard: {
        width: width * 0.8,
        height: 120,
        borderRadius: SIZES.borderRadiusLarge,
        marginRight: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.medium,
    },
    offerContent: {
        flex: 1,
    },
    offerTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        marginBottom: 4,
    },
    offerSubtitle: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textSecondary,
    },
    offerImage: {
        width: 80,
        height: 80,
        borderRadius: SIZES.borderRadius,
    },
    categoriesSection: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.primary,
        fontWeight: SIZES.fontWeight.medium,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - 60) / 3,
        alignItems: 'center',
        marginBottom: 20,
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryEmoji: {
        fontSize: 24,
    },
    categoryName: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.text,
        textAlign: 'center',
        fontWeight: SIZES.fontWeight.medium,
    },
    featuredSection: {
        paddingLeft: SIZES.padding,
        marginBottom: 24,
    },
    productCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadiusLarge,
        marginRight: 16,
        width: 140,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    productImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: SIZES.borderRadiusLarge,
        borderTopRightRadius: SIZES.borderRadiusLarge,
        backgroundColor: COLORS.backgroundDark,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: SIZES.fontSize.small,
        fontWeight: SIZES.fontWeight.medium,
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 16,
    },
    productPrice: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.primary,
        marginBottom: 8,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    bottomSpacing: {
        height: 20, // Base height, will be extended with insets.bottom
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingRight: SIZES.padding,
    },
    profileMenu: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadiusLarge,
        paddingVertical: 8,
        minWidth: 180,
        ...SHADOWS.large,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
        marginLeft: 12,
        fontWeight: SIZES.fontWeight.medium,
    },
    logoutItem: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        marginTop: 4,
    },
    logoutText: {
        color: COLORS.error,
    },
    debugSection: {
        backgroundColor: COLORS.backgroundDark,
        margin: SIZES.padding,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    debugTitle: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        marginBottom: 8,
    },
    debugText: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.textSecondary,
        marginBottom: 4,
        fontFamily: 'monospace',
    },
    debugError: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.error,
        marginBottom: 8,
        fontFamily: 'monospace',
    },
    debugButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.borderRadius,
        marginTop: 8,
    },
    debugButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.small,
        fontWeight: SIZES.fontWeight.medium,
        textAlign: 'center',
    },
});