import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../constants';
import { useCartStore } from '../stores/cartStore';
import { orderService } from '../services/orderService';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type PaymentMethod = 'cod' | 'card' | 'upi';

export default function CheckoutScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { items, totalAmount, clearCart } = useCartStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

    // Delivery Address
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');

    const deliveryFee = 40;
    const totalWithDelivery = totalAmount + deliveryFee;

    const handlePlaceOrder = async () => {
        // Validation
        if (!fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return;
        }
        if (!phone.trim() || phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }
        if (!address.trim()) {
            Alert.alert('Error', 'Please enter your delivery address');
            return;
        }
        if (!city.trim()) {
            Alert.alert('Error', 'Please enter your city');
            return;
        }
        if (!pincode.trim() || pincode.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit pincode');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        setIsProcessing(true);

        try {
            const orderData = {
                paymentMethod: paymentMethod === 'cod' ? 'COD' as const : 'Online' as const,
                shippingAddress: {
                    street: `${address}, ${fullName}, ${phone}`,
                    city: city,
                    state: 'Bihar', 
                    zipCode: pincode,
                },
                notes: `Payment Method: ${paymentMethod.toUpperCase()}. Total: ₹${totalWithDelivery.toFixed(2)} (Items: ₹${totalAmount.toFixed(2)} + Delivery: ₹${deliveryFee.toFixed(2)})`
            };

            console.log('🛒 Creating order with data:', orderData);

            // Create order in database
            const createdOrder = await orderService.createOrder(orderData);

            console.log('✅ Order created successfully:', createdOrder);

            // Clear cart after successful order
            await clearCart();

            Alert.alert(
                'Order Placed Successfully! 🎉',
                `Your order #${createdOrder.orderId} has been placed successfully. You will receive a confirmation shortly.`,
                [
                    {
                        text: 'View Orders',
                        onPress: () => navigation.navigate('MainTabs'),
                    },
                    {
                        text: 'Continue Shopping',
                        onPress: () => navigation.navigate('MainTabs'),
                        style: 'cancel',
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ Order creation failed:', error);
            Alert.alert(
                'Order Failed',
                error.message || 'Failed to place order. Please check your connection and try again.',
                [
                    { text: 'Retry', onPress: handlePlaceOrder },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Delivery Address Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            value={fullName}
                            onChangeText={setFullName}
                            placeholderTextColor="#a0aec0"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                            placeholderTextColor="#a0aec0"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Address *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="House no., Building name, Street"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            placeholderTextColor="#a0aec0"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.inputLabel}>City *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={city}
                                onChangeText={setCity}
                                placeholderTextColor="#a0aec0"
                            />
                        </View>

                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.inputLabel}>Pincode *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Pincode"
                                value={pincode}
                                onChangeText={setPincode}
                                keyboardType="number-pad"
                                maxLength={6}
                                placeholderTextColor="#a0aec0"
                            />
                        </View>
                    </View>
                </View>

                {/* Payment Method Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="card" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'cod' && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <Ionicons name="cash" size={24} color={COLORS.text} />
                            <View style={styles.paymentOptionText}>
                                <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                                <Text style={styles.paymentOptionSubtitle}>
                                    Pay when you receive
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radio,
                                paymentMethod === 'cod' && styles.radioSelected,
                            ]}
                        >
                            {paymentMethod === 'cod' && (
                                <View style={styles.radioDot} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'card' && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <Ionicons name="card-outline" size={24} color={COLORS.text} />
                            <View style={styles.paymentOptionText}>
                                <Text style={styles.paymentOptionTitle}>Credit/Debit Card</Text>
                                <Text style={styles.paymentOptionSubtitle}>Coming soon</Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radio,
                                paymentMethod === 'card' && styles.radioSelected,
                            ]}
                        >
                            {paymentMethod === 'card' && (
                                <View style={styles.radioDot} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'upi' && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setPaymentMethod('upi')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <Ionicons name="phone-portrait" size={24} color={COLORS.text} />
                            <View style={styles.paymentOptionText}>
                                <Text style={styles.paymentOptionTitle}>UPI Payment</Text>
                                <Text style={styles.paymentOptionSubtitle}>Coming soon</Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radio,
                                paymentMethod === 'upi' && styles.radioSelected,
                            ]}
                        >
                            {paymentMethod === 'upi' && (
                                <View style={styles.radioDot} />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Order Summary Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="receipt" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Items ({items.length})</Text>
                        <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
                        <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{totalWithDelivery.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, isProcessing && styles.buttonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Text style={styles.placeOrderButtonText}>
                                Place Order • ₹{totalWithDelivery.toFixed(2)}
                            </Text>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        backgroundColor: COLORS.white,
        marginTop: 12,
        padding: SIZES.padding,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginLeft: 8,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textArea: {
        height: 80,
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        marginBottom: 12,
        backgroundColor: COLORS.background,
    },
    paymentOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#f0fdf4',
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentOptionText: {
        marginLeft: 12,
        flex: 1,
    },
    paymentOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    paymentOptionSubtitle: {
        fontSize: 12,
        color: '#718096',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cbd5e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: COLORS.primary,
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
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
        marginVertical: 12,
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
    footer: {
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
    placeOrderButton: {
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
    buttonDisabled: {
        opacity: 0.6,
    },
    placeOrderButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
