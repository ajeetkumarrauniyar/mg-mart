import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import ProductsScreen from '@/screens/ProductsScreen';
import CartScreen from '@/screens/CartScreen';
import AccountScreen from '@/screens/AccountScreen';
import WishlistScreen from '@/screens/WishlistScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import OrderHistoryScreen from '@/screens/OrderHistoryScreen';
import OrderDetailScreen from '@/screens/OrderDetailScreen';
import AddressBookScreen from '@/screens/AddressBookScreen';
import PaymentMethodsScreen from '@/screens/PaymentMethodsScreen';
import PrivacyPolicyScreen from '@/screens/PrivacyPolicyScreen';
import TermsAndConditionsScreen from '@/screens/TermsAndConditionsScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import LocationSelectionScreen from '@/screens/LocationSelectionScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { useCartStore, useWishlistStore, useAuthStore } from '@/stores';
import { Loading, AnimatedCartBadge } from '@/components';

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
    AddressBook: undefined;
    PaymentMethods: undefined;
    PrivacyPolicy: undefined;
    TermsAndConditions: undefined;
    Notifications: undefined;
    LocationSelection: undefined;
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
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="storefront-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Products"
                component={ProductsScreen}
                options={{
                    tabBarLabel: 'Explore',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="compass-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
                        const { totalItems } = useCartStore();
                        return (
                            <View>
                                <Ionicons name="cart-outline" size={size} color={color} />
                                <AnimatedCartBadge count={totalItems} />
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
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
                        const { wishlistItems } = useWishlistStore();
                        return (
                            <View>
                                <Ionicons name="heart-outline" size={size} color={color} />
                                <AnimatedCartBadge count={wishlistItems.length} />
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={AccountScreen}
                options={{
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
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
    const [navigationReady, setNavigationReady] = React.useState(false);
    const navigationRef = React.useRef<any>(null);

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

    // Handle authentication state changes - redirect to Auth when logged out
    useEffect(() => {
        if (navigationReady && !isLoading) {
            if (!isAuthenticated && navigationRef.current) {
                console.log('🚪 User logged out, redirecting to Auth screen');
                navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                });
            }
        }
    }, [isAuthenticated, isLoading, navigationReady]);

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
        <NavigationContainer
            ref={navigationRef}
            onReady={() => {
                setNavigationReady(true);
                console.log('✅ Navigation ready');
            }}
        >
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
                <Stack.Screen
                    name="AddressBook"
                    component={AddressBookScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PaymentMethods"
                    component={PaymentMethodsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PrivacyPolicy"
                    component={PrivacyPolicyScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="TermsAndConditions"
                    component={TermsAndConditionsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="LocationSelection"
                    component={LocationSelectionScreen}
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
