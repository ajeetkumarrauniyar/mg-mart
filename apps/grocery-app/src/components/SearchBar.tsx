import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: ViewStyle;
    onFilterPress?: () => void;
    showFilterButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder = "Search products...",
    style,
    onFilterPress,
    showFilterButton = true,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.searchContainer}>
                <Ionicons
                    name="search"
                    size={20}
                    color={COLORS.textLight}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={COLORS.textMuted}
                    returnKeyType="search"
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={() => onChangeText('')}
                        style={styles.clearButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                )}
            </View>

            {showFilterButton && (
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={onFilterPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="options" size={20} color={COLORS.text} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundLight,
        borderRadius: SIZES.borderRadiusLarge,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.fontSize.regular,
        color: COLORS.text,
        height: '100%',
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.backgroundLight,
        borderRadius: SIZES.borderRadiusLarge,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
});