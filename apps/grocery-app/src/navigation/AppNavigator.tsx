import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '@/screens/HomeScreen';
import ProductsScreen from '@/screens/ProductsScreen';
import CartScreen from '@/screens/CartScreen';
import ProfileScreen from '@/screens/ProfileScreen';

// Navigation types
export type RootTabParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    MainTabs: undefined;
    ProductDetail: { productId: string };
    Checkout: undefined;
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
                    tabBarLabel: 'Home',
                    // You can add icons here later
                }}
            />
            <Tab.Screen
                name="Products"
                component={ProductsScreen}
                options={{
                    tabBarLabel: 'Products',
                }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Cart',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
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
                {/* Add other screens that need to be outside of tabs */}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
