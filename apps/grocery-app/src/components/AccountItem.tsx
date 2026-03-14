import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface AccountItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    color?: string;
    showChevron?: boolean;
}

export const AccountItem: React.FC<AccountItemProps> = ({
    icon,
    title,
    onPress,
    color = COLORS.text,
    showChevron = true
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.left}>
                <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.title, { color }]}>{title}</Text>
            </View>
            {showChevron && (
                <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
    },
});
