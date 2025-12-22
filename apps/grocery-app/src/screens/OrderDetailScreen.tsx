import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp as NavigationRouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderService } from '../services';
import { successFeedback, errorFeedback } from '../utils/haptics';
import type { Order, OrderItem } from '@mg-mart/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = NavigationRouteProp<RootStackParamList, 'OrderDetail'>;

interface OrderItemCardProps {
    item: OrderItem;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item }) => (
    <View style={styles.orderItemCard}>
        <View style={styles.orderItemInfo}>
            <Text style={styles.orderItemName}>{item.name}</Text>
            <Text style={styles.orderItemPrice}>₹{item.price.toFixed(2)} each</Text>
        </View>
        <View style={styles.orderItemQuantity}>
            <Text style={styles.quantityText}>×{item.quantity}</Text>
            <Text style={styles.subtotalText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
        </View>
    </View>
);

export default function OrderDetailScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        setIsLoading(true);
        try {
            const orderData = await orderService.getOrder(orderId);
            setOrder(orderData);
        } catch (error: any) {
            console.error('Failed to load order details:', error);
            Alert.alert('Error', 'Failed to load order details');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrackOrder = async () => {
        if (!order) return;

        setIsTracking(true);
        try {
            const trackingInfo = await orderService.trackOrder(order.orderId);
            successFeedback();

            Alert.alert(
                'Order Tracking',
                `Status: ${trackingInfo.order.status.toUpperCase()}\n\n${trackingInfo.tracking.statusHistory[0]?.message || 'Order is being processed'}`,
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            errorFeedback();
            Alert.alert('Error', 'Failed to track order');
        } finally {
            setIsTracking(false);
        }
    };

    const handleCancelOrder = () => {
        if (!order) return;

        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: confirmCancelOrder,
                },
            ]
        );
    };

    const confirmCancelOrder = async () => {
        if (!order) return;

        setIsCancelling(true);
        try {
            const cancelledOrder = await orderService.cancelOrder(order.orderId, 'Cancelled by customer');
            setOrder(cancelledOrder);
            successFeedback();
            Alert.alert('Success', 'Order has been cancelled successfully');
        } catch (error: any) {
            errorFeedback();
            Alert.alert('Error', 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#f59e0b';
            case 'processing':
                return '#3b82f6';
            case 'shipped':
                return '#8b5cf6';
            case 'delivered':
                return '#10b981';
            case 'cancelled':
                return '#e53e3e';
            default:
                return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'time-outline';
            case 'processing':
                return 'cog-outline';
            case 'shipped':
                return 'car-outline';
            case 'delivered':
                return 'checkmark-done-circle';
            case 'cancelled':
                return 'close-circle-outline';
            default:
                return 'help-circle-outline';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const canCancelOrder = (status: string) => {
        return ['pending', 'processing'].includes(status.toLowerCase());
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading order details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#e53e3e" />
                    <Text style={styles.errorText}>Order not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusColor = getStatusColor(order.status);
    const statusIcon = getStatusIcon(order.status);

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
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Order Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={[styles.statusIcon, { backgroundColor: `${statusColor}20` }]}>
                            <Ionicons name={statusIcon as any} size={24} color={statusColor} />
                        </View>
                        <View style={styles.statusInfo}>
                            <Text style={styles.orderId}>Order #{order.orderId}</Text>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {order.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.orderDate}>
                        Placed on {formatDate(order.createdAt)}
                    </Text>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
                    <View style={styles.itemsContainer}>
                        {order.items.map((item, index) => (
                            <OrderItemCard key={`${item.productId}-${index}`} item={item} />
                        ))}
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.addressCard}>
                        <Ionicons name="location" size={20} color={COLORS.primary} />
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressText}>
                                {order.shippingAddress.street}
                            </Text>
                            <Text style={styles.addressText}>
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                            </Text>
                            <Text style={styles.addressText}>
                                {order.shippingAddress.zipCode}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Payment Method</Text>
                            <Text style={styles.paymentValue}>
                                {order.paymentDetails.paymentMethod}
                            </Text>
                        </View>
                        {order.paymentDetails.transactionId && (
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Transaction ID</Text>
                                <Text style={styles.paymentValue}>
                                    {order.paymentDetails.transactionId}
                                </Text>
                            </View>
                        )}
                        <View style={styles.divider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{order.totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.trackButton]}
                        onPress={handleTrackOrder}
                        disabled={isTracking}
                    >
                        {isTracking ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Ionicons name="location-outline" size={20} color={COLORS.white} />
                        )}
                        <Text style={styles.actionButtonText}>
                            {isTracking ? 'Tracking...' : 'Track Order'}
                        </Text>
                    </TouchableOpacity>

                    {canCancelOrder(order.status) && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={handleCancelOrder}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <ActivityIndicator size="small" color="#e53e3e" />
                            ) : (
                                <Ionicons name="close-circle-outline" size={20} color="#e53e3e" />
                            )}
                            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
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
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#e53e3e',
        marginTop: 16,
    },
    statusCard: {
        backgroundColor: COLORS.white,
        margin: SIZES.padding,
        padding: 20,
        borderRadius: SIZES.borderRadiusLarge,
        ...SHADOWS.medium,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statusInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 18,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: SIZES.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    orderDate: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    section: {
        marginHorizontal: SIZES.padding,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: SIZES.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: 12,
    },
    itemsContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadiusLarge,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    orderItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    orderItemInfo: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 16,
        fontWeight: SIZES.fontWeight.medium,
        color: COLORS.text,
        marginBottom: 4,
    },
    orderItemPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    orderItemQuantity: {
        alignItems: 'flex-end',
    },
    quantityText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    subtotalText: {
        fontSize: 16,
        fontWeight: SIZES.fontWeight.semibold,
        color: COLORS.text,
    },
    addressCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: SIZES.borderRadiusLarge,
        flexDirection: 'row',
        alignItems: 'flex-start',
        ...SHADOWS.small,
    },
    addressInfo: {
        marginLeft: 12,
        flex: 1,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
    },
    paymentCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: SIZES.borderRadiusLarge,
        ...SHADOWS.small,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: SIZES.fontWeight.medium,
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: SIZES.fontWeight.semibold,
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.padding,
        paddingBottom: 40,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: SIZES.borderRadiusLarge,
        gap: 8,
    },
    trackButton: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.small,
    },
    cancelButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#e53e3e',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: SIZES.fontWeight.semibold,
        color: COLORS.white,
    },
    cancelButtonText: {
        color: '#e53e3e',
    },
});