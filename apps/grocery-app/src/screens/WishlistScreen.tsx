import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@mg-mart/types';
import { useWishlistStore, useCartStore } from '../stores';
import { COLORS, SIZES } from '../constants';

interface WishlistItemProps {
    product: Product;
    onRemove: (productId: string) => void;
    onAddToCart: (product: Product) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ product, onRemove, onAddToCart }) => {
    return (
        <View style={styles.itemContainer}>
            <Image
                source={{ uri: product.imageUrl || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
                resizeMode="cover"
            />

            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={styles.itemDescription} numberOfLines={1}>
                    {product.description}
                </Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>₹{product.price.toFixed(2)}</Text>
                    <Text style={styles.stockText}>
                        {product.stock > 0 ? `${product.stock} ${product.unit} available` : 'Out of stock'}
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemove(product.productId)}
                >
                    <Ionicons name="heart" size={20} color="#e53e3e" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.addToCartButton,
                        product.stock <= 0 && styles.addToCartButtonDisabled
                    ]}
                    onPress={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                >
                    <Ionicons
                        name="cart-outline"
                        size={16}
                        color={product.stock > 0 ? COLORS.white : '#a0aec0'}
                    />
                    <Text style={[
                        styles.addToCartText,
                        product.stock <= 0 && styles.addToCartTextDisabled
                    ]}>
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const WishlistScreen: React.FC = () => {
    const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlistStore();
    const { addItem } = useCartStore();

    const handleRemoveFromWishlist = (productId: string) => {
        removeFromWishlist(productId);
    };

    const handleAddToCart = (product: Product) => {
        if (product.stock <= 0) {
            Alert.alert('Out of Stock', 'This product is currently unavailable');
            return;
        }
        addItem(product.productId, 1);
        Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
    };

    const handleClearWishlist = () => {
        Alert.alert(
            'Clear Wishlist',
            'Are you sure you want to remove all items from your wishlist?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: clearWishlist
                },
            ]
        );
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
            onRemove={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Wishlist</Text>
                {wishlistItems.length > 0 && (
                    <TouchableOpacity onPress={handleClearWishlist}>
                        <Text style={styles.clearButton}>Clear All</Text>
                    </TouchableOpacity>
                )}
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
                    />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: SIZES.fontSize.xlarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    clearButton: {
        color: '#e53e3e',
        fontSize: SIZES.fontSize.medium,
        fontWeight: '600',
    },
    itemCount: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
    },
    itemCountText: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.textSecondary,
    },
    listContainer: {
        paddingHorizontal: SIZES.padding,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: SIZES.borderRadius,
        backgroundColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: SIZES.fontSize.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    stockText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    actionButtons: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 8,
    },
    removeButton: {
        padding: 8,
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.borderRadius,
        marginTop: 8,
    },
    addToCartButtonDisabled: {
        backgroundColor: '#e2e8f0',
    },
    addToCartText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    addToCartTextDisabled: {
        color: '#a0aec0',
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

export default WishlistScreen;