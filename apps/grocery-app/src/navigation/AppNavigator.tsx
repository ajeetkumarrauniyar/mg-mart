import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import ProductsScreen from '@/screens/ProductsScreen';
import CartScreen from '@/screens/CartScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import WhislistScreen from '@/screens/WhislistScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import { useCartStore } from '@/stores/cartStore';

// Navigation types
export type RootTabParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined;
    Whislist: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    MainTabs: undefined;
    ProductDetail: { productId: string };
    Checkout: undefined;
    EditProfile: undefined;
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
                name="Whislist"
                component={WhislistScreen}
                options={{
                    tabBarLabel: 'Favourite',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart-outline" size={size} color={color} />
                    ),
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
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="MainTabs"
                screenOptions={{ headerShown: false }}
            >
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
