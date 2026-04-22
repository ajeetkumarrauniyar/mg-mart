import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';

interface HomeSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit?: (query: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
    value,
    onChangeText,
    onSubmit,
    placeholder = "Search for groceries...",
    autoFocus = false,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <TouchableOpacity
                    onPress={() => onSubmit?.(value)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.icon} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                    returnKeyType="search"
                    autoFocus={autoFocus}
                    onSubmitEditing={() => onSubmit?.(value)}
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={() => onChangeText('')}
                        activeOpacity={0.7}
                        style={styles.clearButton}
                    >
                        <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
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
        ...SHADOWS.small,
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
    clearButton: {
        padding: 4,
    },
});

export default HomeSearchBar;
