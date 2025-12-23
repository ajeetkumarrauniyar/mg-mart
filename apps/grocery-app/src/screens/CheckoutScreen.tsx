// Enhanced checkout screen with location-based ordering integration
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../constants';
import { useCartStore } from '../stores/cartStore';
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

export default function CheckoutScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { items, totalAmount, clearCart } = useCartStore();

    // Location state
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationResult, setValidationResult] = useState<LocationValidationResult | null>(null);
    const [isValidatingLocation, setIsValidatingLocation] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'unknown' | 'checking' | 'valid' | 'invalid'>('unknown');

    // Order details
    const deliveryFee = 40;
    const totalWithDelivery = totalAmount + deliveryFee;

    useEffect(() => {
        // Check location status when screen loads
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
            console.error('Error checking location status:', error);
            setLocationStatus('invalid');
        }
    };

    const handleLocationValidation = async () => {
        setIsValidatingLocation(true);

        try {
            // First check if we need permission
            const serviceStatus = await locationService.getServiceStatus();

            if (serviceStatus.permissionStatus !== PermissionStatus.GRANTED) {
                setShowPermissionModal(true);
                setIsValidatingLocation(false);
                return;
            }

            // Validate location for order
            const result = await locationService.validateOrderLocation();
            setValidationResult(result);

            if (result.isValid) {
                setLocationStatus('valid');
                if (result.validationType === ValidationType.APPROVED) {
                    // Auto-proceed for approved locations
                    proceedToOrderPlacement();
                } else {
                    // Show validation modal for warning cases
                    setShowValidationModal(true);
                }
            } else {
                setLocationStatus('invalid');
                setShowValidationModal(true);
            }
        } catch (error) {
            console.error('Location validation failed:', error);
            Alert.alert(
                'Location Error',
                'Unable to validate your location. Please check your GPS settings and try again.',
                [{ text: 'OK' }]
            );
            setLocationStatus('invalid');
        } finally {
            setIsValidatingLocation(false);
        }
    };

    const handlePermissionGranted = () => {
        setShowPermissionModal(false);
        // Retry location validation after permission granted
        setTimeout(() => {
            handleLocationValidation();
        }, 500);
    };

    const handlePermissionDenied = () => {
        setShowPermissionModal(false);
        setLocationStatus('invalid');
        Alert.alert(
            'Location Required',
            'Location access is required to place orders. Please enable location services to continue.',
            [{ text: 'OK' }]
        );
    };

    const handleValidationSuccess = () => {
        setShowValidationModal(false);
        setLocationStatus('valid');
        proceedToOrderPlacement();
    };

    const handleValidationFailure = () => {
        setShowValidationModal(false);
        setLocationStatus('invalid');
    };

    const proceedToOrderPlacement = async () => {
        setIsPlacingOrder(true);

        try {
            // Create order with location validation
            const orderData = {
                paymentMethod: 'COD' as const,
                shippingAddress: {
                    street: 'Current Location', // This would be filled from actual address
                    city: 'Jahingara',
                    state: 'Bihar',
                    zipCode: '000000'
                },
                notes: 'Order placed with location validation'
            };

            const order = await orderService.createOrder(orderData);

            // Clear cart after successful order
            await clearCart();

            Alert.alert(
                'Order Placed Successfully!',
                `Your order #${order.orderId} has been placed and will be delivered soon.`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('MainTabs', { screen: 'Home' })
                    }
                ]
            );
        } catch (error) {
            console.error('Order placement failed:', error);
            Alert.alert(
                'Order Failed',
                error instanceof Error ? error.message : 'Failed to place order. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const renderLocationStatus = () => {
        switch (locationStatus) {
            case 'checking':
                return (
                    <View style={styles.locationStatus}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.locationStatusText}>Checking location...</Text>
                    </View>
                );

            case 'valid':
                return (
                    <View style={[styles.locationStatus, styles.locationValid]}>
                        <Ionicons name="checkmark-circle" size={20} color="#48bb78" />
                        <Text style={[styles.locationStatusText, { color: '#48bb78' }]}>
                            Location verified
                        </Text>
                    </View>
                );

            case 'invalid':
                return (
                    <View style={[styles.locationStatus, styles.locationInvalid]}>
                        <Ionicons name="alert-circle" size={20} color="#f56565" />
                        <Text style={[styles.locationStatusText, { color: '#f56565' }]}>
                            Location verification required
                        </Text>
                    </View>
                );

            default:
                return null;
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
                    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
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

                {/* Location Verification */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Location</Text>
                    <Text style={styles.sectionSubtitle}>
                        We need to verify your location to ensure delivery within our service area
                    </Text>

                    {renderLocationStatus()}

                    {locationStatus !== 'valid' && (
                        <TouchableOpacity
                            style={styles.verifyLocationButton}
                            onPress={handleLocationValidation}
                            disabled={isValidatingLocation}
                        >
                            {isValidatingLocation ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Ionicons name="location" size={20} color={COLORS.white} />
                            )}
                            <Text style={styles.verifyLocationButtonText}>
                                {isValidatingLocation ? 'Verifying...' : 'Verify Location'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentOption}>
                        <View style={styles.paymentOptionContent}>
                            <Ionicons name="cash" size={24} color={COLORS.primary} />
                            <View style={styles.paymentOptionText}>
                                <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                                <Text style={styles.paymentOptionSubtitle}>Pay when you receive your order</Text>
                            </View>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    </View>
                </View>

                {/* Delivery Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Information</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color="#718096" />
                        <Text style={styles.infoText}>Estimated delivery: 30-45 minutes</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={20} color="#718096" />
                        <Text style={styles.infoText}>Delivery within 5km radius</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        (locationStatus !== 'valid' || isPlacingOrder) && styles.placeOrderButtonDisabled
                    ]}
                    onPress={proceedToOrderPlacement}
                    disabled={locationStatus !== 'valid' || isPlacingOrder}
                >
                    {isPlacingOrder ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <>
                            <Text style={styles.placeOrderButtonText}>
                                Place Order • ₹{totalWithDelivery.toFixed(2)}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Location Modals */}
            <LocationPermissionModal
                visible={showPermissionModal}
                onPermissionGranted={handlePermissionGranted}
                onPermissionDenied={handlePermissionDenied}
                onClose={() => setShowPermissionModal(false)}
            />

            <LocationValidationModal
                visible={showValidationModal}
                validationResult={validationResult}
                onValidationSuccess={handleValidationSuccess}
                onValidationFailure={handleValidationFailure}
                onClose={() => setShowValidationModal(false)}
            />
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
        fontWeight: '600',
        color: COLORS.text,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginTop: 16,
        padding: SIZES.padding,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 16,
        lineHeight: 20,
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
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    locationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f7fafc',
        marginBottom: 16,
    },
    locationValid: {
        backgroundColor: '#f0fff4',
        borderWidth: 1,
        borderColor: '#9ae6b4',
    },
    locationInvalid: {
        backgroundColor: '#fed7d7',
        borderWidth: 1,
        borderColor: '#feb2b2',
    },
    locationStatusText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        color: COLORS.text,
    },
    verifyLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    verifyLocationButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f7fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    paymentOptionContent: {
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
        fontSize: 14,
        color: '#718096',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#718096',
        marginLeft: 12,
    },
    footer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    placeOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    placeOrderButtonDisabled: {
        backgroundColor: '#cbd5e0',
    },
    placeOrderButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});