import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import CategoriesScreen from '@/screens/CategoriesScreen';
import ProductsScreen from '@/screens/ProductsScreen';
import CartScreen from '@/screens/CartScreen';
import AccountScreen from '@/screens/AccountScreen';
import WishlistScreen from '@/screens/WishlistScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import OrderHistoryScreen from '@/screens/OrderHistoryScreen';

import EditProfileScreen from '@/screens/EditProfileScreen';
import OrderDetailScreen from '@/screens/OrderDetailScreen';
import AddressBookScreen from '@/screens/AddressBookScreen';
import PaymentMethodsScreen from '@/screens/PaymentMethodsScreen';
import PrivacyPolicyScreen from '@/screens/PrivacyPolicyScreen';
import TermsAndConditionsScreen from '@/screens/TermsAndConditionsScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import LocationSelectionScreen from '@/screens/LocationSelectionScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAuthStore } from '@/stores';
import { Loading, FloatingCartBar } from '@/components';
import { COLORS } from '@/constants';

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootTabParamList = {
    Home: undefined;
    Categories: undefined;
    OrderAgain: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    MainTabs: { screen?: keyof RootTabParamList } | undefined;
    ProductDetail: { productId: string };
    Products: { category?: string; initialQuery?: string };

    // Stack-accessible screens (no longer tabs)
    Cart: undefined;
    Account: undefined;
    Wishlist: undefined;

    // Account sub-screens
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

// ─── Tab Navigator (3 tabs) ───────────────────────────────────────────────────

function TabNavigator() {
    const insets = useSafeAreaInsets();
    // Use actual safe area bottom inset so tab bar clears the OS nav bar on all devices
    const tabBarHeight = 54 + insets.bottom;

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#4a5568',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e2e8f0',
                    borderTopWidth: 1,
                    height: tabBarHeight,
                    paddingBottom: insets.bottom + 4,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                tabBarActiveBackgroundColor: '#E8F5E9',
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="storefront-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarLabel: 'Categories',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="OrderAgain"
                component={OrderHistoryScreen}
                options={{
                    tabBarLabel: 'Order Again',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="time-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// ─── Main App Navigator ───────────────────────────────────────────────────────

export default function AppNavigator() {
    const { isAuthenticated, isLoading, loadStoredAuth, user, token } = useAuthStore();
    const [navigationReady, setNavigationReady] = React.useState(false);
    const navigationRef = React.useRef<any>(null);

    // Fallback: Load stored auth if not already loaded after a short delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if ((user && token) && !isAuthenticated && !isLoading) {
                console.log('🔄 AppNavigator: Fallback - calling loadStoredAuth');
                loadStoredAuth();
            }
        }, 100);
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

    if (isLoading) {
        console.log('⏳ AppNavigator: Showing loading screen');
        return <Loading />;
    }

    const initialRoute = isAuthenticated ? 'MainTabs' : 'Auth';
    console.log('🎯 AppNavigator: Setting initial route to:', initialRoute);

    return (
        <SafeAreaProvider>
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

                {/* Main tabs wrapper — FloatingCartBar is injected here in Plan 11.2 */}
                <Stack.Screen
                    name="MainTabs"
                    options={{ headerShown: false }}
                >
                {(props) => (
                        <View style={{ flex: 1 }}>
                            <TabNavigator />
                            <FloatingCartBar />
                        </View>
                    )}
                </Stack.Screen>

                {/* Product screens */}
                <Stack.Screen
                    name="ProductDetail"
                    component={ProductDetailScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Products"
                    component={ProductsScreen}
                    options={{ headerShown: false }}
                />

                {/* Formerly-tab screens — now stack-accessible */}
                <Stack.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Account"
                    component={AccountScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Wishlist"
                    component={WishlistScreen}
                    options={{ headerShown: false }}
                />

                {/* Account sub-screens */}
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
        </SafeAreaProvider>
    );
}
