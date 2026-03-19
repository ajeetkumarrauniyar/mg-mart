import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES, SHADOWS, SLOTS, PAYMENT_METHODS, ZIP_CODE } from '../constants';
import { useCartStore, useLocationStore } from '@/stores';
import type { CartItemWithProduct } from '@/stores/cartStore';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AuthGuard, OptimizedImage, QuantityStepper, ScreenContainer, AppHeader } from '@/components';
import { orderService } from '@/services';
import {
    LocationPermissionModal,
    LocationValidationModal,
} from '../components/location';
import {
    locationService,
    PermissionStatus,
    ValidationType,
    type LocationValidationResult,
} from '@/services/location';

type NavigationProp = StackNavigationProp<RootStackParamList>;

function CartContent() {
    const navigation = useNavigation<NavigationProp>();
    const { items, totalAmount, totalItems, deliveryFee, handlingFee, grandTotal, isLoading, updateItem, removeItem, clearCart } =
        useCartStore();
    const { locationName } = useLocationStore();

    // Checkout state
    const [selectedSlot, setSelectedSlot] = useState<string>(SLOTS[0].id);
    const [selectedPayment, setSelectedPayment] = useState('COD');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Location state
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationResult, setValidationResult] = useState<LocationValidationResult | null>(null);
    const [isValidatingLocation, setIsValidatingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'unknown' | 'checking' | 'valid' | 'invalid'>('unknown');

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

    const handleLocationValidation = async () => {
        setIsValidatingLocation(true);
        try {
            const serviceStatus = await locationService.getServiceStatus();
            if (serviceStatus.permissionStatus !== PermissionStatus.GRANTED) {
                setShowPermissionModal(true);
                return;
            }
            const result = await locationService.validateOrderLocation();
            setValidationResult(result);
            if (result.isValid) {
                setLocationStatus('valid');
                if (result.validationType !== ValidationType.APPROVED) {
                    setShowValidationModal(true);
                }
            } else {
                setLocationStatus('invalid');
                setShowValidationModal(true);
            }
        } catch (error) {
            Alert.alert('Location Error', 'Unable to validate location.');
        } finally {
            setIsValidatingLocation(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart');
            return;
        }

        if (locationStatus !== 'valid') {
            await handleLocationValidation();
            return;
        }

        setIsPlacingOrder(true);
        try {
            const orderData = {
                paymentMethod: selectedPayment as any,
                shippingAddress: {
                    street: locationName || 'Current Location',
                    city: 'Jahingara',
                    state: 'Bihar',
                    zipCode: ZIP_CODE,
                },
                notes: `Slot: ${SLOTS.find((s) => s.id === selectedSlot)?.time}`,
            };

            const order = await orderService.createOrder(orderData);
            await clearCart();

            Alert.alert(
                'Order Placed!',
                `Order #${order.orderId} will reach you shortly.`,
                [
                    {
                        text: 'Great!',
                        onPress: () => navigation.navigate('OrderHistory'),
                    },
                ],
            );
        } catch (error) {
            Alert.alert('Order Failed', 'Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const renderCartItem = ({ item }: { item: CartItemWithProduct }) => (
        <View style={styles.cartItem}>
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
            >
                <OptimizedImage
                    source={{ uri: item.imageUrl || '' }}
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


    const renderCheckoutSections = () => {
        if (items.length === 0) return null;

        return (
            <View style={styles.checkoutContainer}>
                {/* Bill Summary */}
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
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.row}>
                            <Ionicons name="location" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('LocationSelection')}>
                            <Text style={styles.changeBtn}>CHANGE</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                        {locationName}
                    </Text>

                    {locationStatus !== 'valid' && (
                        <TouchableOpacity
                            style={styles.verifyBtn}
                            onPress={handleLocationValidation}
                            disabled={isValidatingLocation}
                        >
                            {isValidatingLocation ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <>
                                    <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
                                    <Text style={styles.verifyBtnText}>Verify delivery location</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Delivery Slots */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Delivery Slot</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.slotScroll}
                    >
                        {SLOTS.map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                style={[styles.slotCard, selectedSlot === slot.id && styles.activeSlot]}
                                onPress={() => setSelectedSlot(slot.id)}
                            >
                                <Text style={[styles.slotTime, selectedSlot === slot.id && styles.activeText]}>
                                    {slot.time}
                                </Text>
                                <Text style={[styles.slotDesc, selectedSlot === slot.id && styles.activeSubText]}>
                                    {slot.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    {PAYMENT_METHODS.filter((m) => m.visible).map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.paymentCard, selectedPayment === method.id && styles.activePayment]}
                            onPress={() => setSelectedPayment(method.id)}
                        >
                            <Ionicons
                                name={method.icon as any}
                                size={24}
                                color={selectedPayment === method.id ? COLORS.primary : COLORS.textLight}
                            />
                            <View style={styles.paymentInfo}>
                                <Text style={styles.paymentTitle}>{method.title}</Text>
                                <Text style={styles.paymentSub}>{method.sub}</Text>
                            </View>
                            <View style={styles.radio}>
                                {selectedPayment === method.id && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}
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
                            <Text style={styles.totalSubtext}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutBtn, (isLoading || isPlacingOrder) && styles.disabledBtn]}
                            onPress={handlePlaceOrder}
                            disabled={isLoading || isPlacingOrder}
                            activeOpacity={0.9}
                        >
                            {isPlacingOrder ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Text style={styles.checkoutBtnText}>Place Order</Text>
                                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                                </>
                            )}
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
                ListFooterComponent={renderCheckoutSections}
                contentContainerStyle={items.length === 0 ? styles.emptyList : styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <LocationPermissionModal
                visible={showPermissionModal}
                onPermissionGranted={() => setShowPermissionModal(false)}
                onPermissionDenied={() => setShowPermissionModal(false)}
                onClose={() => setShowPermissionModal(false)}
            />

            <LocationValidationModal
                visible={showValidationModal}
                validationResult={validationResult}
                onValidationSuccess={() => setShowValidationModal(false)}
                onValidationFailure={() => setShowValidationModal(false)}
                onClose={() => setShowValidationModal(false)}
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
    checkoutContainer: {
        marginTop: 8,
    },
    billSummary: {
        backgroundColor: COLORS.backgroundDark + '50',
        marginHorizontal: SIZES.padding,
        marginTop: 8,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
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
    section: {
        backgroundColor: COLORS.white,
        padding: 16,
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    changeBtn: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    verifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        padding: 8,
        backgroundColor: COLORS.primary + '15',
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    verifyBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    slotScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    slotCard: {
        width: 150,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 12,
    },
    activeSlot: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    slotTime: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    slotDesc: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    activeText: { color: COLORS.primary },
    activeSubText: { color: COLORS.primary + 'CC' },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 10,
    },
    activePayment: {
        backgroundColor: COLORS.primary + '05',
        borderColor: COLORS.primary,
    },
    paymentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    paymentSub: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
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
        color: COLORS.textSecondary,
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
    disabledBtn: {
        backgroundColor: '#D1D5DB',
    },
});

export default function CartScreen() {
    return (
        <AuthGuard fallbackMessage="Please login to view your cart and manage items">
            <CartContent />
        </AuthGuard>
    );
}