import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Product } from '@mg-mart/types';
import { useWishlistStore, useCartStore } from '../stores';
import { COLORS, SIZES } from '../constants';
import { OptimizedImage, AuthGuard } from '../components';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface WishlistItemProps {
    product: Product;
    onProductPress: (productId: string) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ product, onProductPress }) => {
    return (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => onProductPress(product.productId)}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <OptimizedImage
                    source={{ uri: product.imageUrl || 'https://via.placeholder.com/60' }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
                {product.stock <= 0 && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                    {product.name}
                </Text>
                <Text style={styles.itemDetails} numberOfLines={1}>
                    {product.unit}, Price
                </Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={styles.itemPrice}>₹{product.price.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
                style={styles.arrowButton}
                onPress={() => onProductPress(product.productId)}
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const WishlistContent: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { wishlistItems } = useWishlistStore();
    const { addItem } = useCartStore();

    const handleProductPress = (productId: string) => {
        navigation.navigate('ProductDetail', { productId });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#cbd5e0" />
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
                Add items you love to your wishlist and shop them later
            </Text>
        </View>
    );

    const renderWishlistItem = ({ item }: { item: Product }) => (
        <WishlistItem
            product={item}
            onProductPress={handleProductPress}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Favourite</Text>
            </View>

            {wishlistItems.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <View style={styles.itemCount}>
                        <Text style={styles.itemCountText}>
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                        </Text>
                    </View>

                    <FlatList
                        data={wishlistItems}
                        renderItem={renderWishlistItem}
                        keyExtractor={(item) => item.productId}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />

                    {/* Add All To Cart Button */}
                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity
                            style={styles.addAllButton}
                            onPress={() => {
                                wishlistItems.forEach(product => {
                                    if (product.stock > 0) {
                                        addItem(product.productId, 1);
                                    }
                                });
                                Alert.alert('Added to Cart', 'All available items have been added to your cart');
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.addAllButtonText}>Add All To Cart</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    itemCount: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    itemCountText: {
        fontSize: 14,
        color: '#718096',
    },
    listContainer: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 100, // Space for bottom button
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 80, // Align with text content
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 16,
        paddingHorizontal: SIZES.padding,
    },
    imageContainer: {
        position: 'relative',
        width: 60,
        height: 60,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginRight: 16,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#e53e3e',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemInfo: {
        flex: 1,
        marginRight: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        color: '#718096',
    },
    priceContainer: {
        marginRight: 12,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    arrowButton: {
        padding: 4,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        paddingVertical: 20,
        paddingBottom: 34, // Safe area padding
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    addAllButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addAllButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
    },
    emptyTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

const WishlistScreen: React.FC = () => {
    return (
        <AuthGuard fallbackMessage="Please login to view your favorite items">
            <WishlistContent />
        </AuthGuard>
    );
};

export default WishlistScreen;