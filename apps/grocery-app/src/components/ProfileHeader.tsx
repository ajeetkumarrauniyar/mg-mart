import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants';

interface ProfileHeaderProps {
    name: string;
    phone: string;
    onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, phone, onEdit }) => {
    const getInitials = (n: string) => n.split(' ').map(i => i[0]).join('').slice(0, 2).toUpperCase();

    return (
        <TouchableOpacity style={styles.container} onPress={onEdit} activeOpacity={0.9}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(name || 'User')}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.name}>{name || 'Guest User'}</Text>
                <Text style={styles.phone}>{phone || 'Add phone number'}</Text>
            </View>
            <View style={styles.editBtn}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 16,
        ...SHADOWS.small,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary + '30',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    details: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    phone: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    editBtn: {
        padding: 4,
    }
});
