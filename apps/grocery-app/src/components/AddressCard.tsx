import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants';
import { SavedAddress } from '../stores/addressStore';

interface AddressCardProps {
    address: SavedAddress;
    onEdit: () => void;
    onDelete: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete }) => {
    const getIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home': return 'home-outline';
            case 'work': return 'business-outline';
            default: return 'location-outline';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <Ionicons name={getIcon(address.label)} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.info}>
                    <View style={styles.headerRow}>
                        <Text style={styles.label}>{address.label}</Text>
                        {address.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultText}>DEFAULT</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                        {address.street}, {address.city}, {address.state} - {address.zipCode}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    left: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    info: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    defaultBadge: {
        backgroundColor: '#F0FFF4',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#48BB78',
    },
    addressText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    actionBtn: {
        padding: 8,
    },
});
