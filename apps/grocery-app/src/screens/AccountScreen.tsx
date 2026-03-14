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
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useAuthStore } from '../stores';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
    AuthGuard,
    ProfileHeader,
    AccountItem,
    AccountSection
} from '../components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

function AccountContent() {
    const navigation = useNavigation<NavigationProp>();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Account</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <ProfileHeader
                    name={user?.name || 'Guest'}
                    phone={user?.phoneNumber || user?.email || 'No phone added'}
                    onEdit={() => navigation.navigate('EditProfile')}
                />

                {/* Quick Actions Grid */}
                <View style={styles.grid}>
                    <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('OrderHistory')}>
                        <View style={[styles.gridIcon, { backgroundColor: '#FFF5F5' }]}>
                            <Ionicons name="receipt" size={24} color="#F56565" />
                        </View>
                        <Text style={styles.gridLabel}>Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('AddressBook')}>
                        <View style={[styles.gridIcon, { backgroundColor: '#F0FFF4' }]}>
                            <Ionicons name="location" size={24} color="#48BB78" />
                        </View>
                        <Text style={styles.gridLabel}>Addresses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Wishlist' })}>
                        <View style={[styles.gridIcon, { backgroundColor: '#EBF8FF' }]}>
                            <Ionicons name="heart" size={24} color="#4299E1" />
                        </View>
                        <Text style={styles.gridLabel}>Wishlist</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('PaymentMethods')}>
                        <View style={[styles.gridIcon, { backgroundColor: '#FAF5FF' }]}>
                            <Ionicons name="card" size={24} color="#9F7AEA" />
                        </View>
                        <Text style={styles.gridLabel}>Payments</Text>
                    </TouchableOpacity>
                </View>

                <AccountSection title="Support">
                    <AccountItem
                        icon="help-buoy-outline"
                        title="Help & Support"
                        onPress={() => Alert.alert('Support', 'Contacting support...')}
                        color="#4A5568"
                    />
                    <View style={styles.divider} />
                    <AccountItem
                        icon="call-outline"
                        title="Contact Store"
                        onPress={() => Alert.alert('Contact', 'Calling store...')}
                        color="#4A5568"
                    />
                </AccountSection>

                <AccountSection title="App Settings">
                    <AccountItem
                        icon="notifications-outline"
                        title="Notifications"
                        onPress={() => Alert.alert('Settings', 'Notification settings')}
                    />
                    <View style={styles.divider} />
                    <AccountItem
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        onPress={() => Alert.alert('Privacy', 'Privacy Policy content')}
                    />
                    <View style={styles.divider} />
                    <AccountItem
                        icon="document-text-outline"
                        title="Terms & Conditions"
                        onPress={() => Alert.alert('Terms', 'Terms and conditions content')}
                    />
                </AccountSection>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.version}>MG Mart v1.2.0</Text>
                    <Text style={styles.credit}>Made with ❤️ in India</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

export default function AccountScreen() {
    return (
        <AuthGuard>
            <AccountContent />
        </AuthGuard>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
    },
    content: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        marginTop: 10,
    },
    gridItem: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: 12,
    },
    gridIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        ...SHADOWS.small,
    },
    gridLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 64,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginHorizontal: 16,
        padding: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FED7D7',
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E53E3E',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
        paddingBottom: 20,
    },
    version: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    credit: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 4,
    }
});
