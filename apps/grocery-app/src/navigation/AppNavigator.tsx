import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import ProductsScreen from '@/screens/ProductsScreen';
import CartScreen from '@/screens/CartScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import WishlistScreen from '@/screens/WishlistScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import OrderHistoryScreen from '@/screens/OrderHistoryScreen';
import OrderDetailScreen from '@/screens/OrderDetailScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { useCartStore, useWishlistStore, useAuthStore } from '@/stores';
import { Loading } from '@/components';

// Navigation types
export type RootTabParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined;
    Wishlist: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    MainTabs: { screen?: keyof RootTabParamList } | undefined;
    ProductDetail: { productId: string };
    Checkout: undefined;
    EditProfile: undefined;
    OrderHistory: undefined;
    OrderDetail: { orderId: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Tab Navigator
function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#48bb78',
                tabBarInactiveTintColor: '#4a5568',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e2e8f0',
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Shop',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="storefront-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Products"
                component={ProductsScreen}
                options={{
                    tabBarLabel: 'Explore',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="compass-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color, size }) => {
                        const { totalItems } = useCartStore();
                        return (
                            <View>
                                <Ionicons name="cart-outline" size={size} color={color} />
                                {totalItems > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {totalItems > 99 ? '99+' : totalItems}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Wishlist"
                component={WishlistScreen}
                options={{
                    tabBarLabel: 'Favourite',
                    tabBarIcon: ({ color, size }) => {
                        const { wishlistItems } = useWishlistStore();
                        return (
                            <View>
                                <Ionicons name="heart-outline" size={size} color={color} />
                                {wishlistItems.length > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// Main App Navigator
export default function AppNavigator() {
    const { isAuthenticated, isLoading, loadStoredAuth, user, token } = useAuthStore();

    // Fallback: Load stored auth if not already loaded after a short delay
    useEffect(() => {
        const timer = setTimeout(() => {
            // If we have token/user but not authenticated, something went wrong with rehydration
            if ((user && token) && !isAuthenticated && !isLoading) {
                console.log('🔄 AppNavigator: Fallback - calling loadStoredAuth');
                loadStoredAuth();
            }
        }, 100); // Small delay to allow rehydration to complete

        return () => clearTimeout(timer);
    }, [user, token, isAuthenticated, isLoading, loadStoredAuth]);

    // Debug logging
    useEffect(() => {
        console.log('🔍 AppNavigator: Auth state changed', {
            isAuthenticated,
            isLoading,
            hasUser: !!user,
            hasToken: !!token
        });
    }, [isAuthenticated, isLoading, user, token]);

    // Show loading while checking auth state
    if (isLoading) {
        console.log('⏳ AppNavigator: Showing loading screen');
        return <Loading />;
    }

    const initialRoute = isAuthenticated ? "MainTabs" : "Auth";
    console.log('🎯 AppNavigator: Setting initial route to:', initialRoute);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={initialRoute}
            >
                <Stack.Screen
                    name="Auth"
                    component={AuthScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="MainTabs"
                    options={{ headerShown: false }}
                >
                    {() => <TabNavigator />}
                </Stack.Screen>
                <Stack.Screen
                    name="ProductDetail"
                    component={ProductDetailScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Checkout"
                    component={CheckoutScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="OrderHistory"
                    component={OrderHistoryScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="OrderDetail"
                    component={OrderDetailScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}


const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -8,
        top: -4,
        backgroundColor: '#e53e3e',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
});
