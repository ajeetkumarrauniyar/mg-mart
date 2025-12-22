import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { ProductCategory } from '@mg-mart/types';
import { COLORS, SIZES } from '../constants';

interface CategoryFilterProps {
    categories: (ProductCategory | 'all')[];
    selectedCategory: ProductCategory | 'all';
    onCategorySelect: (category: ProductCategory | 'all') => void;
    style?: ViewStyle;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    selectedCategory,
    onCategorySelect,
    style,
}) => {
    const renderCategoryItem = ({ item }: { item: ProductCategory | 'all' }) => {
        const isSelected = selectedCategory === item;
        const displayName = item === 'all' ? 'All' : item;

        return (
            <TouchableOpacity
                style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonActive,
                ]}
                onPress={() => onCategorySelect(item)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.categoryButtonText,
                        isSelected && styles.categoryButtonTextActive,
                    ]}
                >
                    {displayName}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, style]}>
            <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={renderCategoryItem}
                contentContainerStyle={styles.categoryList}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    categoryList: {
        paddingHorizontal: SIZES.padding,
    },
    separator: {
        width: 8,
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.backgroundLight,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        minWidth: 80,
        alignItems: 'center',
    },
    categoryButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryButtonText: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: SIZES.fontWeight.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    categoryButtonTextActive: {
        color: COLORS.white,
        fontWeight: SIZES.fontWeight.semibold,
    },
});