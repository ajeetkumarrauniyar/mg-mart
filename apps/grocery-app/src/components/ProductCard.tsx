import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@mg-mart/types';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useCartStore, useWishlistStore, useAuthStore } from '../stores';
import { useRequireAuth } from '../hooks';
import { addToCartFeedback, selectionFeedback } from '../utils/haptics';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
    product: Product;
    onPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ product, onPress }) => {
    const { addItem } = useCartStore();
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const { requireAuth } = useRequireAuth();

    const handleAddToCart = useCallback(() => {
        if (product.stock <= 0) {
            Alert.alert('Out of Stock', 'This product is currently unavailable');
            return;
        }

        requireAuth(() => {
            addToCartFeedback(); // Haptic feedback
            addItem(product.productId, 1);
            Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
        });
    }, [product.productId, product.stock, product.name, addItem, requireAuth]);

    const handleWishlistToggle = useCallback((e?: any) => {
        if (e) e.stopPropagation();
        requireAuth(() => {
            selectionFeedback(); // Haptic feedback
            toggleWishlist(product);
        });
    }, [product, toggleWishlist, requireAuth]);

    const handlePress = useCallback(() => {
        selectionFeedback(); // Haptic feedback
        if (onPress) {
            onPress(product);
        }
    }, [onPress, product]);

    const isWishlisted = isInWishlist(product.productId);

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
            <OptimizedImage
                source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.image}
                resizeMode="cover"
            />
            <TouchableOpacity
                style={styles.wishlistButton}
                onPress={handleWishlistToggle}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={isWishlisted ? "heart" : "heart-outline"}
                    size={20}
                    color={isWishlisted ? "#e53e3e" : "#4a5568"}
                />
            </TouchableOpacity>
            {product.stock <= 0 && (
                <View style={styles.outOfStockBadge}>
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                </View>
            )}
            {product.isFeatured && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>FEATURED</Text>
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                    {product.description}
                </Text>
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
                        <Text style={styles.stockText}>
                            {product.stock > 0 ? `${product.stock} ${product.unit} left` : 'Out of stock'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, product.stock <= 0 && styles.addButtonDisabled]}
                        onPress={handleAddToCart}
                        disabled={product.stock <= 0}
                    >
                        <Text style={styles.addButtonText}>
                            {product.stock > 0 ? '+ Add' : 'Unavailable'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        width: '48%',
        backgroundColor: COLORS.cardBackground,
        borderRadius: SIZES.borderRadiusLarge,
        marginBottom: SIZES.margin,
        overflow: 'hidden',
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: COLORS.backgroundDark,
    },
    wishlistButton: {
        position: 'absolute',
        top: SIZES.marginSmall,
        right: SIZES.marginSmall,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: SIZES.borderRadiusXLarge,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    outOfStockBadge: {
        position: 'absolute',
        top: SIZES.marginSmall,
        right: 52,
        backgroundColor: COLORS.errorLight,
        paddingHorizontal: SIZES.marginSmall,
        paddingVertical: 4,
        borderRadius: SIZES.borderRadiusSmall,
    },
    outOfStockText: {
        color: COLORS.error,
        fontSize: SIZES.fontSize.tiny,
        fontWeight: SIZES.fontWeight.semibold,
    },
    discountBadge: {
        position: 'absolute',
        top: SIZES.marginSmall,
        left: SIZES.marginSmall,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.marginSmall,
        paddingVertical: 4,
        borderRadius: SIZES.borderRadiusSmall,
    },
    discountText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.tiny,
        fontWeight: SIZES.fontWeight.bold,
    },
    info: {
        padding: SIZES.paddingSmall,
    },
    name: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: SIZES.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: 4,
    },
    description: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.textSecondary,
        marginBottom: SIZES.marginSmall,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: SIZES.fontSize.large,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.primary,
    },
    stockText: {
        fontSize: SIZES.fontSize.tiny,
        color: COLORS.textLight,
        marginTop: 2,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.margin,
        paddingVertical: SIZES.marginSmall,
        borderRadius: SIZES.borderRadius,
        ...SHADOWS.small,
    },
    addButtonDisabled: {
        backgroundColor: COLORS.textMuted,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.small,
        fontWeight: SIZES.fontWeight.semibold,
    },
});

ProductCard.displayName = 'ProductCard';
