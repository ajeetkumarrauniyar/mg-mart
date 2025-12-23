import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '@/constants';
import { useCartStore, CartItemWithProduct } from '@/stores/cartStore';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AuthGuard } from '@/components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

function CartContent() {
    const navigation = useNavigation<NavigationProp>();
    const { items, totalAmount, totalItems, isLoading, updateItem, removeItem, clearCart } =
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
                style={styles.itemImageContainer}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
            >
                <Image
                    source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            <View style={styles.itemDetails}>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('ProductDetail', { productId: item.productId })
                    }
                >
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.itemPrice}>
                    ₹{item.price.toFixed(2)} / {item.unit}
                </Text>

                <View style={styles.itemFooter}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item, -1)}
                            disabled={isLoading}
                        >
                            <Ionicons
                                name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                                size={16}
                                color={item.quantity === 1 ? '#e53e3e' : COLORS.text}
                            />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item, 1)}
                            disabled={isLoading}
                        >
                            <Ionicons name="add" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.itemSubtotal}>₹{item.subtotal.toFixed(2)}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item)}
                disabled={isLoading}
            >
                <Ionicons name="close-circle" size={24} color="#cbd5e0" />
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>Shopping Cart</Text>
                <Text style={styles.subtitle}>
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Text>
            </View>
            {items.length > 0 && (
                <TouchableOpacity onPress={handleClearCart} disabled={isLoading}>
                    <Text style={styles.clearButton}>Clear All</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="cart-outline" size={80} color="#cbd5e0" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add items to get started</Text>
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
            >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    // const renderFooter = () => {
    //     if (items.length === 0) return null;

    //     return (
    //         <View style={styles.summaryContainer}>
    //             <View style={styles.summaryRow}>
    //                 <Text style={styles.summaryLabel}>Subtotal</Text>
    //                 <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
    //             </View>
    //             <View style={styles.summaryRow}>
    //                 <Text style={styles.summaryLabel}>Delivery Fee</Text>
    //                 <Text style={styles.summaryValue}>₹40.00</Text>
    //             </View>
    //             <View style={styles.divider} />
    //             <View style={styles.summaryRow}>
    //                 <Text style={styles.totalLabel}>Total</Text>
    //                 <Text style={styles.totalValue}>₹{(totalAmount + 40).toFixed(2)}</Text>
    //             </View>
    //         </View>
    //     );
    // };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.productId}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                // ListFooterComponent={renderFooter}
                contentContainerStyle={items.length === 0 ? styles.emptyList : styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {items.length > 0 && (
                <View style={styles.checkoutBar}>
                    <View style={styles.checkoutInfo}>
                        <Text style={styles.checkoutLabel}>Total Amount</Text>
                        <Text style={styles.checkoutAmount}>
                            ₹{(totalAmount + 40).toFixed(2)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={handleCheckout}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        padding: SIZES.padding,
        paddingTop: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
    },
    clearButton: {
        fontSize: 14,
        color: '#e53e3e',
        fontWeight: '600',
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    itemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 20,
    },
    itemPrice: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    quantityButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        minWidth: 32,
        textAlign: 'center',
    },
    itemSubtotal: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    removeButton: {
        padding: 4,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: SIZES.padding,
    },
    emptyIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#f7fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#718096',
        marginBottom: 32,
    },
    shopButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    shopButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    summaryContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginTop: 16,
        marginBottom: 16,
        padding: SIZES.padding,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#718096',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.primary,
    },
    checkoutBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    checkoutInfo: {
        marginBottom: 12,
    },
    checkoutLabel: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 4,
    },
    checkoutAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    checkoutButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    checkoutButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default function CartScreen() {
    return (
        <AuthGuard fallbackMessage="Please login to view your cart and manage items">
            <CartContent />
        </AuthGuard>
    );
}