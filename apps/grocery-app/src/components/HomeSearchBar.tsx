import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';

interface HomeSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
    value,
    onChangeText,
    placeholder = "Search 'paneer'",
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                />
                <View style={styles.divider} />
                <TouchableOpacity style={styles.micButton}>
                    <Ionicons name="mic-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 10,
    },
    micButton: {
        padding: 4,
    },
});

export default HomeSearchBar;
