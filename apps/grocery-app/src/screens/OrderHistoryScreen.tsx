import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SHADOWS } from '../constants';
import { useOrderStore } from '../stores';
import type { Order } from '@mg-mart/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AuthGuard, ScreenContainer, AppHeader } from '../components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const OrderCard: React.FC<{ order: Order; onPress: () => void }> = ({ order, onPress }) => {
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return { bg: '#F0FFF4', color: '#48BB78', label: 'Delivered' };
            case 'cancelled': return { bg: '#FFF5F5', color: '#F56565', label: 'Cancelled' };
            case 'processing': return { bg: '#EBF8FF', color: '#4299E1', label: 'Processing' };
            case 'pending': return { bg: '#FFFBEB', color: '#D69E2E', label: 'Placed' };
            default: return { bg: '#F7FAFC', color: '#4A5568', label: status };
        }
    };

    const statusStyle = getStatusStyle(order.status);
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.cardTop}>
                <View>
                    <Text style={styles.orderId}>Order #{order.orderId.slice(-8).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>{date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                </View>
            </View>

            <View style={styles.cardMiddle}>
                <View style={styles.itemsSummary}>
                    <Ionicons name="cart-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.itemsText}>
                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'} • ₹{order.totalAmount}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBottom}>
                <Text style={styles.viewDetailText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
        </TouchableOpacity>
    );
};

const OrderHistoryContent: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { orders, isLoading, fetchOrders } = useOrderStore();

    useEffect(() => {
        fetchOrders();
    }, []);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet!</Text>
            <Text style={styles.emptySubtitle}>
                When you place an order, it will appear here for you to track.
            </Text>
            <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
            >
                <Text style={styles.shopBtnText}>Browse Products</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenContainer
            header={<AppHeader title="Order History" />}
            scrollable={false}
        >
            {isLoading && orders.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.orderId}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            onPress={() => navigation.navigate('OrderDetail', { orderId: item.orderId })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchOrders} colors={[COLORS.primary]} />
                    }
                />
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 12,
        marginBottom: 12,
    },
    orderId: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    cardMiddle: {
        marginBottom: 12,
    },
    itemsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    itemsText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    cardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    viewDetailText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    shopBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 14,
    },
    shopBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default function OrderHistoryScreen() {
    return (
        <AuthGuard>
            <OrderHistoryContent />
        </AuthGuard>
    );
}