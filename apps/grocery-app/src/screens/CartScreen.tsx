import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useCartStore, CartItemWithProduct } from '@/stores/cartStore';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AuthGuard, OptimizedImage, QuantityStepper, ScreenContainer, AppHeader } from '@/components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

function CartContent() {
    const navigation = useNavigation<NavigationProp>();
    const { items, totalAmount, totalItems, deliveryFee, handlingFee, grandTotal, isLoading, updateItem, removeItem, clearCart } =
        useCartStore();

    const handleQuantityChange = async (item: CartItemWithProduct, delta: number) => {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
            handleRemoveItem(item);
            return;
        }
        try {
            await updateItem(item.productId, newQuantity);
        } catch (error) {
            Alert.alert('Error', 'Failed to update quantity');
        }
    };

    const handleRemoveItem = (item: CartItemWithProduct) => {
        Alert.alert(
            'Remove Item',
            `Remove ${item.name} from cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeItem(item.productId);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove item');
                        }
                    },
                },
            ]
        );
    };

    const handleClearCart = () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCart();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear cart');
                        }
                    },
                },
            ]
        );
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
            return;
        }
        navigation.navigate('Checkout');
    };

    const renderCartItem = ({ item }: { item: CartItemWithProduct }) => (
        <View style={styles.cartItem}>
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
            >
                <OptimizedImage
                    source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
                    >
                        <Text style={styles.itemName} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <Text style={styles.itemUnit}>{item.unit}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleRemoveItem(item)}
                        style={styles.removeIcon}
                    >
                        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.itemFooter}>
                    <Text style={styles.itemSubtotal}>₹{item.subtotal.toFixed(0)}</Text>
                    <QuantityStepper
                        quantity={item.quantity}
                        onIncrease={() => handleQuantityChange(item, 1)}
                        onDecrease={() => handleQuantityChange(item, -1)}
                        isLoading={isLoading}
                    />
                </View>
            </View>
        </View>
    );


    const renderFooter = () => {
        if (items.length === 0) return null;

        return (
            <View style={styles.billSummary}>
                <Text style={styles.billTitle}>Bill Summary</Text>

                <View style={styles.billRow}>
                    <View style={styles.rowLabelGroup}>
                        <Ionicons name="receipt-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.billRowLabel}>Item Total</Text>
                    </View>
                    <Text style={styles.billRowValue}>₹{totalAmount.toFixed(0)}</Text>
                </View>

                <View style={styles.billRow}>
                    <View style={styles.rowLabelGroup}>
                        <Ionicons name="bicycle-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.billRowLabel}>Delivery Fee</Text>
                    </View>
                    <Text style={[styles.billRowValue, { color: COLORS.success }]}>₹{deliveryFee}</Text>
                </View>

                <View style={styles.billRow}>
                    <View style={styles.rowLabelGroup}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.billRowLabel}>Handling Fee</Text>
                    </View>
                    <Text style={styles.billRowValue}>₹{handlingFee}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.billRow}>
                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                    <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(0)}</Text>
                </View>

                <View style={styles.savingsBox}>
                    <Ionicons name="gift-outline" size={16} color={COLORS.success} />
                    <Text style={styles.savingsText}>YAY! You saved ₹80 on this order</Text>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="cart-outline" size={80} color={COLORS.border} />
            </View>
            <Text style={styles.emptyTitle}>Cart is empty</Text>
            <Text style={styles.emptySubtitle}>You haven&apos;t added anything yet</Text>
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
            >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenContainer
            header={
                <AppHeader
                    title="My Cart"
                    showBackButton={false}
                    rightAction={
                        items.length > 0 && (
                            <TouchableOpacity onPress={handleClearCart}>
                                <Ionicons name="trash-outline" size={24} color={COLORS.error} />
                            </TouchableOpacity>
                        )
                    }
                />
            }
            scrollable={false}
            bottomTabOffset
            footer={
                items.length > 0 ? (
                    <View style={styles.bottomBar}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalPrice}>₹{grandTotal.toFixed(0)}</Text>
                            <Text style={styles.totalSubtext}>VIEW DETAILED BILL</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={handleCheckout}
                            disabled={isLoading}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                ) : undefined
            }
        >
            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.productId}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                contentContainerStyle={items.length === 0 ? styles.emptyList : styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    listContent: {
        paddingBottom: 120,
    },
    emptyList: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: SIZES.fontSize.large,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    clearBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    clearText: {
        fontSize: 12,
        color: COLORS.error,
        fontWeight: '600',
    },
    cartItem: {
        flexDirection: 'row',
        marginHorizontal: SIZES.padding,
        marginBottom: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: COLORS.backgroundDark,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    itemUnit: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    removeIcon: {
        padding: 4,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemSubtotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    billSummary: {
        backgroundColor: COLORS.backgroundDark + '50',
        marginHorizontal: SIZES.padding,
        marginTop: 8,
        borderRadius: 16,
        padding: 16,
    },
    billTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rowLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    billRowLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    billRowValue: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },
    grandTotalLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    grandTotalValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    savingsBox: {
        backgroundColor: COLORS.successLight,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
    },
    savingsText: {
        fontSize: 11,
        color: COLORS.success,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    shopButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    bottomBar: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        paddingTop: 12,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.large,
    },
    totalContainer: {
        flex: 1,
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
    },
    totalSubtext: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    checkoutBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...SHADOWS.medium,
    },
    checkoutBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default function CartScreen() {
    return (
        <AuthGuard fallbackMessage="Please login to view your cart and manage items">
            <CartContent />
        </AuthGuard>
    );
}