import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../constants';
import { useAuthStore } from '../stores';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    iconColor?: string;
    iconBg?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    iconColor = COLORS.primary,
    iconBg = '#f0fdf4',
}) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {showArrow && (
            <Ionicons name="chevron-forward" size={20} color="#cbd5e0" />
        )}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user, logout } = useAuthStore();

    // Debug: Log user data when component renders
    React.useEffect(() => {
        console.log('🏠 ProfileScreen user data updated:', user?.name, user?.email);
    }, [user]);

    const handleEditProfile = () => {
        navigation.navigate('EditProfile');
    };

    const handleOrders = () => {
        navigation.navigate('OrderHistory');
    };

    const handleAddresses = () => {
        Alert.alert('Addresses', 'Address management coming soon!');
    };

    const handlePaymentMethods = () => {
        Alert.alert('Payment Methods', 'Payment methods coming soon!');
    };

    const handleNotifications = () => {
        Alert.alert('Notifications', 'Notification settings coming soon!');
    };

    const handleHelp = () => {
        Alert.alert('Help & Support', 'Help center coming soon!');
    };

    const handleAbout = () => {
        Alert.alert(
            'About MG-MART',
            'Version 1.0.0\n\nYour trusted grocery delivery partner.\n\n© 2026 MG-MART. All rights reserved.'
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        Alert.alert('Success', 'Logged out successfully');
                    },
                },
            ]
        );
    };

    // Get user initials for avatar
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Account</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {getInitials(user?.name)}
                            </Text>
                        </View>
                        <View style={styles.profileDetails}>
                            <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
                            <Text style={styles.profileEmail}>{user?.email || 'guest@mgmart.com'}</Text>
                            {user?.phoneNumber && (
                                <Text style={styles.profilePhone}>{user.phoneNumber}</Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEditProfile}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="receipt-outline"
                            title="My Orders"
                            subtitle="View your order history"
                            onPress={handleOrders}
                            iconColor="#f59e0b"
                            iconBg="#fef3c7"
                        />
                        <MenuItem
                            icon="location-outline"
                            title="Delivery Addresses"
                            subtitle="Manage your addresses"
                            onPress={handleAddresses}
                            iconColor="#3b82f6"
                            iconBg="#dbeafe"
                        />
                        <MenuItem
                            icon="card-outline"
                            title="Payment Methods"
                            subtitle="Manage payment options"
                            onPress={handlePaymentMethods}
                            iconColor="#8b5cf6"
                            iconBg="#ede9fe"
                        />
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="notifications-outline"
                            title="Notifications"
                            subtitle="Manage notifications"
                            onPress={handleNotifications}
                            iconColor="#06b6d4"
                            iconBg="#cffafe"
                        />
                        <MenuItem
                            icon="help-circle-outline"
                            title="Help & Support"
                            subtitle="Get help and support"
                            onPress={handleHelp}
                            iconColor="#10b981"
                            iconBg="#d1fae5"
                        />
                        <MenuItem
                            icon="information-circle-outline"
                            title="About"
                            subtitle="App version and info"
                            onPress={handleAbout}
                            iconColor="#6366f1"
                            iconBg="#e0e7ff"
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={22} color="#e53e3e" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>MG-MART v1.0.0</Text>
                    <Text style={styles.footerSubtext}>
                        Made with ❤️ by IT Maverick Solutions
                    </Text>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.text,
    },
    profileCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginTop: 16,
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.white,
    },
    profileDetails: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 2,
    },
    profilePhone: {
        fontSize: 14,
        color: '#718096',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: '#f0fdf4',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 4,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: SIZES.padding,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuGroup: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f7fafc',
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#718096',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fee2e2',
        elevation: 1,
        shadowColor: '#e53e3e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e53e3e',
        marginLeft: 8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 32,
        paddingHorizontal: SIZES.padding,
    },
    footerText: {
        fontSize: 12,
        color: '#a0aec0',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#cbd5e0',
    },
});
