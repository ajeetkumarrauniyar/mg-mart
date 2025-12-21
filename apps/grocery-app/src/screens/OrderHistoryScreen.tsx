import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { orderService } from '../services';
import type { Order } from '@mg-mart/types';

interface OrderItemProps {
    order: Order;
    onPress: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onPress }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#f59e0b';
            case 'confirmed':
                return '#3b82f6';
            case 'preparing':
                return '#8b5cf6';
            case 'out_for_delivery':
                return '#06b6d4';
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
            case 'confirmed':
                return 'checkmark-circle-outline';
            case 'preparing':
                return 'restaurant-outline';
            case 'out_for_delivery':
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
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusColor = getStatusColor(order.status);
    const statusIcon = getStatusIcon(order.status);

    return (
        <TouchableOpacity style={styles.orderItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{order.orderId}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <Ionicons name={statusIcon as any} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {order.status.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.itemCount}>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </Text>
                <Text style={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.orderFooter}>
                <Text style={styles.deliveryAddress} numberOfLines={1}>
                    📍 {order.shippingAddress.street}, {order.shippingAddress.city}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e0" />
            </View>
        </TouchableOpacity>
    );
};

export default function OrderHistoryScreen() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async (refresh = false) => {
        if (refresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const response = await orderService.getOrders();
            setOrders(response.orders);
        } catch (err: any) {
            setError(err.message || 'Failed to load orders');
            console.error('Failed to load orders:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleOrderPress = (order: Order) => {
        // TODO: Navigate to order detail screen
        Alert.alert(
            `Order #${order.orderId}`,
            `Status: ${order.status}\nTotal: ₹${order.totalAmount.toFixed(2)}\nItems: ${order.items.length}`,
            [
                { text: 'Track Order', onPress: () => handleTrackOrder(order.orderId) },
                { text: 'Close', style: 'cancel' },
            ]
        );
    };

    const handleTrackOrder = async (orderId: string) => {
        try {
            const trackingInfo = await orderService.trackOrder(orderId);
            Alert.alert(
                'Order Tracking',
                `Status: ${trackingInfo.order.status}\n${trackingInfo.tracking.statusHistory[0]?.message || 'Order is being processed'}`
            );
        } catch (error: any) {
            Alert.alert('Error', 'Failed to track order');
        }
    };

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.emptyText}>Loading orders...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#e53e3e" />
                    <Text style={styles.errorText}>❌ {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadOrders()}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color="#cbd5e0" />
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptySubtitle}>Start shopping to see your orders here</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('MainTabs' as never)}
                >
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.backButton} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            <FlatList
                data={orders}
                renderItem={({ item }) => (
                    <OrderItem order={item} onPress={() => handleOrderPress(item)} />
                )}
                keyExtractor={(item) => item.orderId}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadOrders(true)}
                        colors={[COLORS.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
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
        fontWeight: '700',
        color: COLORS.text,
    },
    listContent: {
        padding: SIZES.padding,
    },
    emptyList: {
        flexGrow: 1,
    },
    orderItem: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#718096',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemCount: {
        fontSize: 14,
        color: '#718096',
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deliveryAddress: {
        fontSize: 12,
        color: '#718096',
        flex: 1,
        marginRight: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: SIZES.padding,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#e53e3e',
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
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
});