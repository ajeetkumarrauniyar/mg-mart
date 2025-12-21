import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@mg-mart/types';
import { COLORS, SIZES } from '../constants';
import { useCartStore, useWishlistStore, useAuthStore } from '../stores';
import { useRequireAuth } from '../hooks';
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
            addItem(product.productId, 1);
            Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
        });
    }, [product.productId, product.stock, product.name, addItem, requireAuth]);

    const handleWishlistToggle = useCallback((e?: any) => {
        if (e) e.stopPropagation();
        requireAuth(() => {
            toggleWishlist(product);
        });
    }, [product, toggleWishlist, requireAuth]);

    const handlePress = useCallback(() => {
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
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 8,
        right: 52,
        backgroundColor: '#fed7d7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    outOfStockText: {
        color: '#c53030',
        fontSize: 10,
        fontWeight: '600',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#48bb78',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    info: {
        padding: 12,
    },
    name: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    description: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: SIZES.fontSize.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    stockText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: SIZES.borderRadius,
    },
    addButtonDisabled: {
        backgroundColor: '#cbd5e0',
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.small,
        fontWeight: '600',
    },
});

ProductCard.displayName = 'ProductCard';
