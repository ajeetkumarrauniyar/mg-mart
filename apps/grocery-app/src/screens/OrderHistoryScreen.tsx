import React, { useEffect, useState, useCallback } from 'react';
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
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useOrderStore } from '../stores';
import type { Order } from '@mg-mart/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AuthGuard, ScreenContainer, AppHeader, HomeSearchBar } from '../components';

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
                onPress={() => navigation.navigate('MainTabs', { screen: 'Categories' })}
            >
                <Text style={styles.shopBtnText}>Browse Products</Text>
            </TouchableOpacity>
        </View>
    );

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = useCallback((query: string) => {
        if (!query.trim()) return;
        navigation.navigate('Products', { initialQuery: query.trim() });
    }, [navigation]);

    return (
        <ScreenContainer
            header={
                <>
                    <AppHeader title="Order Again" />
                    <HomeSearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmit={handleSearch}
                        placeholder="Search products to reorder..."
                    />
                </>
            }
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
        padding: SIZES.margin,
        paddingBottom: 120,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadiusXLarge,
        padding: SIZES.margin,
        marginBottom: SIZES.margin,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingBottom: SIZES.paddingSmall,
        marginBottom: SIZES.paddingSmall,
    },
    orderId: {
        fontSize: SIZES.fontSize.regular,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    orderDate: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: SIZES.paddingSmall,
        paddingVertical: 4,
        borderRadius: SIZES.borderRadius,
    },
    statusText: {
        fontSize: SIZES.fontSize.tiny,
        fontWeight: SIZES.fontWeight.bold,
    },
    cardMiddle: {
        marginBottom: SIZES.paddingSmall,
    },
    itemsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    itemsText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
        fontWeight: SIZES.fontWeight.medium,
    },
    cardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    viewDetailText: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.primary,
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingLarge,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.marginLarge,
    },
    emptyTitle: {
        fontSize: SIZES.fontSize.xlarge,
        fontWeight: SIZES.fontWeight.extrabold,
        color: COLORS.text,
        marginBottom: SIZES.marginSmall,
    },
    emptySubtitle: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SIZES.marginLarge,
    },
    shopBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.paddingLarge,
        paddingVertical: SIZES.paddingSmall,
        borderRadius: SIZES.borderRadiusLarge,
        minHeight: SIZES.button.large,
        justifyContent: 'center',
    },
    shopBtnText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.regular,
        fontWeight: SIZES.fontWeight.bold,
    },
});

export default function OrderHistoryScreen() {
    return (
        <AuthGuard>
            <OrderHistoryContent />
        </AuthGuard>
    );
}