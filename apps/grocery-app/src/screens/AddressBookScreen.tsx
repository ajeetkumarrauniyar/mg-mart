import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useAddressStore } from '../stores';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AuthGuard, AddressCard } from '../components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AddressBookContent: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { addresses, removeAddress } = useAddressStore();

    const handleAddAddress = () => {
        Alert.alert('Add Address', 'Address addition flow coming soon!');
    };

    const handleEditAddress = () => {
        Alert.alert('Edit Address', 'Address editing flow coming soon!');
    };

    const handleDeleteAddress = (id: string) => {
        Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeAddress(id) }
        ]);
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="location-outline" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved addresses!</Text>
            <Text style={styles.emptySubtitle}>
                Add your delivery addresses for a faster checkout experience.
            </Text>
            <TouchableOpacity
                style={styles.addBtnLarge}
                onPress={handleAddAddress}
            >
                <Text style={styles.addBtnTextLarge}>+ Add New Address</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Address Book</Text>
                <TouchableOpacity onPress={handleAddAddress} style={styles.addIconBtn}>
                    <Ionicons name="add" size={26} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
                renderEmptyState()
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={addresses}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <AddressCard
                                address={item}
                                onEdit={handleEditAddress}
                                onDelete={() => handleDeleteAddress(item.id)}
                            />
                        )}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.addBtnFixed} onPress={handleAddAddress}>
                            <Text style={styles.addBtnTextLarge}>Add New Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

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
    addIconBtn: {
        padding: 4,
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
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
    addBtnLarge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 14,
        ...SHADOWS.medium,
    },
    addBtnTextLarge: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    addBtnFixed: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
});

export default function AddressBookScreen() {
    return (
        <AuthGuard>
            <AddressBookContent />
        </AuthGuard>
    );
}
