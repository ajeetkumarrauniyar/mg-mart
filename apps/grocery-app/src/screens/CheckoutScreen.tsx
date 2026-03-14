// Enhanced checkout screen with location-based ordering integration
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useCartStore, useLocationStore } from '../stores';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LocationPermissionModal, LocationValidationModal } from '../components/location';
import {
    locationService,
    PermissionStatus,
    ValidationType,
    type LocationValidationResult
} from '../services/location';
import { orderService } from '../services';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DELIVERY_FEE = 40;
const HANDLING_FEE = 5;

const SLOTS = [
    { id: '1', time: 'ASAP (15-20 mins)', description: 'Express Delivery' },
    { id: '2', time: '6 PM - 8 PM', description: 'Evening Slot' },
    { id: '3', time: '8 PM - 10 PM', description: 'Late Night' },
    { id: '4', time: 'Tomorrow 7 AM - 9 AM', description: 'Morning Fresh' },
];

const PAYMENT_METHODS = [
    { id: 'COD', title: 'Cash on Delivery', sub: 'Pay at your doorstep', icon: 'cash-outline' },
    { id: 'UPI', title: 'UPI / Google Pay / PhonePe', sub: 'Instant & Secure', icon: 'flash-outline' },
    { id: 'Wallet', title: 'MG Wallet', sub: 'Balance: ₹150.00', icon: 'wallet-outline' },
];

export default function CheckoutScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { items, totalAmount, clearCart } = useCartStore();
    const { locationName } = useLocationStore();

    // UI state
    const [selectedSlot, setSelectedSlot] = useState(SLOTS[0].id);
    const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
    const [deliveryNotes, setDeliveryNotes] = useState('');

    // Location state
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationResult, setValidationResult] = useState<LocationValidationResult | null>(null);
    const [isValidatingLocation, setIsValidatingLocation] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'unknown' | 'checking' | 'valid' | 'invalid'>('unknown');

    const grandTotal = useMemo(() => totalAmount + DELIVERY_FEE + HANDLING_FEE, [totalAmount]);

    useEffect(() => {
        checkLocationStatus();
    }, []);

    const checkLocationStatus = async () => {
        setLocationStatus('checking');
        try {
            const serviceStatus = await locationService.getServiceStatus();
            if (serviceStatus.serviceHealth === 'healthy' && serviceStatus.hasStoredLocation) {
                setLocationStatus('valid');
            } else {
                setLocationStatus('invalid');
            }
        } catch (error) {
            setLocationStatus('invalid');
        }
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

    const proceedToOrderPlacement = async () => {
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
                    zipCode: '000000'
                },
                notes: `${deliveryNotes} | Slot: ${SLOTS.find(s => s.id === selectedSlot)?.time}`
            };

            const order = await orderService.createOrder(orderData);
            await clearCart();

            Alert.alert(
                'Order Placed!',
                `Order #${order.orderId} will reach you in 20 mins.`,
                [{ text: 'Great!', onPress: () => navigation.navigate('OrderHistory') }]
            );
        } catch (error) {
            Alert.alert('Order Failed', 'Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Order</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    <Text style={styles.addressText} numberOfLines={2}>{locationName}</Text>

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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotScroll}>
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
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.paymentCard, selectedPayment === method.id && styles.activePayment]}
                            onPress={() => setSelectedPayment(method.id)}
                        >
                            <Ionicons name={method.icon as any} size={24} color={selectedPayment === method.id ? COLORS.primary : COLORS.textLight} />
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

                {/* Extra Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Instructions</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Ring the bell, Gate code 123..."
                        value={deliveryNotes}
                        onChangeText={setDeliveryNotes}
                        multiline
                    />
                </View>

                {/* Bill Summary */}
                <View style={[styles.section, styles.billSection]}>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>₹{totalAmount.toFixed(0)}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={[styles.billValue, { color: COLORS.success }]}>FREE</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Handling Fee</Text>
                        <Text style={styles.billValue}>₹{HANDLING_FEE}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.billRow}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>₹{grandTotal.toFixed(0)}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalBox}>
                    <Text style={styles.footerPrice}>₹{grandTotal.toFixed(0)}</Text>
                    <Text style={styles.totalItems}>{items.length} Items</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeBtn, isPlacingOrder && styles.disabledBtn]}
                    onPress={proceedToOrderPlacement}
                    disabled={isPlacingOrder}
                >
                    {isPlacingOrder ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <>
                            <Text style={styles.placeBtnText}>Place Order</Text>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        flex: 1,
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
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 12,
        height: 60,
        fontSize: 14,
        textAlignVertical: 'top',
    },
    billSection: {
        backgroundColor: 'transparent',
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    billValue: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#D1D5DB',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.large,
    },
    totalBox: {
        flex: 1,
    },
    footerPrice: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
    },
    totalItems: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    placeBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    placeBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
    },
    disabledBtn: {
        backgroundColor: '#D1D5DB',
    },
    activeText: { color: COLORS.primary },
    activeSubText: { color: COLORS.primary + 'CC' },
});