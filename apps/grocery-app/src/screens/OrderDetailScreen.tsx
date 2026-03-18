import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp as NavigationRouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SHADOWS } from '../constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderService } from '../services';
import type { Order, OrderItem } from '@mg-mart/types';
import { AuthGuard, ScreenContainer } from '../components';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = NavigationRouteProp<RootStackParamList, 'OrderDetail'>;

const OrderItemRow: React.FC<{ item: OrderItem }> = ({ item }) => (
    <View style={styles.itemRow}>
        <View style={styles.itemIconBox}>
            <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.itemMain}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity} × ₹{item.price}</Text>
        </View>
        <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
    </View>
);

const DetailSection: React.FC<{ title: string; children: React.ReactNode; icon: keyof typeof Ionicons.glyphMap }> = ({ title, children, icon }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionCard}>{children}</View>
    </View>
);

function OrderDetailContent() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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
            console.error('Failed to load order:', error);
            Alert.alert('Error', 'Failed to load order details');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: confirmCancelOrder }
            ]
        );
    };

    const confirmCancelOrder = async () => {
        if (!order) return;
        setIsCancelling(true);
        try {
            const updated = await orderService.cancelOrder(order.orderId);
            setOrder(updated);
            Alert.alert('Success', 'Order cancelled successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return { bg: '#F0FFF4', color: '#48BB78', label: 'Delivered', icon: 'checkmark-circle' };
            case 'cancelled': return { bg: '#FFF5F5', color: '#F56565', label: 'Cancelled', icon: 'close-circle' };
            case 'processing': return { bg: '#EBF8FF', color: '#4299E1', label: 'Processing', icon: 'sync' };
            case 'shipped': return { bg: '#FAF5FF', color: '#9F7AEA', label: 'Out for Delivery', icon: 'bicycle' };
            default: return { bg: '#FFFBEB', color: '#D69E2E', label: 'Placed', icon: 'time' };
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!order) return null;

    const status = getStatusStyle(order.status);
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <ScreenContainer
            header={
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 40 }} />
                </View>
            }
            footer={
                <View style={styles.footer}>
                    <View style={styles.supportBox}>
                        <TouchableOpacity style={styles.supportBtn} onPress={() => Alert.alert('Support', 'Connecting to support...')}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.supportBtnText}>Need Help?</Text>
                        </TouchableOpacity>

                        {['pending', 'processing'].includes(order.status.toLowerCase()) && (
                            <TouchableOpacity
                                style={[styles.supportBtn, styles.cancelBtn]}
                                onPress={handleCancelOrder}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <ActivityIndicator size="small" color="#E53E3E" />
                                ) : (
                                    <>
                                        <Ionicons name="close-circle-outline" size={20} color="#E53E3E" />
                                        <Text style={[styles.supportBtnText, { color: '#E53E3E' }]}>Cancel Order</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            <View style={[styles.statusHero, { backgroundColor: status.bg }]}>
                <View style={styles.statusHeroInfo}>
                    <Text style={[styles.statusHeroLabel, { color: status.color }]}>{status.label}</Text>
                    <Text style={styles.statusHeroId}>#{order.orderId.toUpperCase()}</Text>
                    <Text style={styles.statusHeroDate}>{date}</Text>
                </View>
                <Ionicons name={status.icon as any} size={60} color={status.color} opacity={0.2} />
            </View>

            {/* Items Section */}
            <DetailSection title="Items Summary" icon="list-outline">
                {order.items.map((item, idx) => (
                    <View key={idx}>
                        <OrderItemRow item={item} />
                        {idx < order.items.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}
                <View style={styles.billDivider} />
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Item Total</Text>
                    <Text style={styles.billValue}>₹{order.totalAmount}</Text>
                </View>
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Delivery Fee</Text>
                    <Text style={[styles.billValue, { color: '#48BB78' }]}>FREE</Text>
                </View>
                <View style={[styles.billRow, { marginTop: 8 }]}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                </View>
            </DetailSection>

            {/* Delivery details */}
            <DetailSection title="Delivery Address" icon="location-outline">
                <Text style={styles.addressName}>Home</Text>
                <Text style={styles.addressText}>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {'\n'}
                    {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                </Text>
            </DetailSection>

            {/* Payment details */}
            <DetailSection title="Payment Information" icon="card-outline">
                <View style={styles.paymentBox}>
                    <Ionicons name="cash-outline" size={20} color={COLORS.text} />
                    <View>
                        <Text style={styles.paymentMethod}>{order.paymentDetails.paymentMethod}</Text>
                        <Text style={styles.paymentStatus}>Transaction Successful</Text>
                    </View>
                </View>
            </DetailSection>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
    },
    content: {
        flex: 1,
    },
    statusHero: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        margin: 16,
        borderRadius: 20,
        ...SHADOWS.small,
    },
    statusHeroInfo: {
        flex: 1,
    },
    statusHeroLabel: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statusHeroId: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 2,
    },
    statusHeroDate: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemMain: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    itemQty: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    itemTotal: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    billDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderRadius: 1,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    billLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    billValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.primary,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    paymentBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentMethod: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    paymentStatus: {
        fontSize: 12,
        color: '#48BB78',
        fontWeight: '600',
    },
    footer: {
        paddingBottom: 32,
        backgroundColor: '#F7FAFC',
    },
    supportBox: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        backgroundColor: '#F7FAFC',
    },
    supportBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        gap: 8,
        ...SHADOWS.small,
    },
    supportBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cancelBtn: {
        borderColor: '#FED7D7',
    },
});

export default function OrderDetailScreen() {
    return (
        <AuthGuard>
            <OrderDetailContent />
        </AuthGuard>
    );
}