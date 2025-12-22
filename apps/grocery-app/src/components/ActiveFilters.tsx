import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductFilters, ProductCategory } from '@mg-mart/types';
import { COLORS, SIZES } from '../constants';

interface ActiveFiltersProps {
    filters: ProductFilters;
    selectedCategory: ProductCategory | 'all';
    onRemoveFilter: (filterKey: keyof ProductFilters) => void;
    onRemoveCategory: () => void;
    onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
    filters,
    selectedCategory,
    onRemoveFilter,
    onRemoveCategory,
    onClearAll,
}) => {
    const getActiveFilters = () => {
        const activeFilters: Array<{ key: keyof ProductFilters | 'category'; label: string; onRemove: () => void }> = [];

        // Category filter
        if (selectedCategory !== 'all') {
            activeFilters.push({
                key: 'category',
                label: selectedCategory,
                onRemove: onRemoveCategory,
            });
        }

        // Price range filter
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            let priceLabel = '';
            if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
                priceLabel = `₹${filters.minPrice} - ₹${filters.maxPrice}`;
            } else if (filters.minPrice !== undefined) {
                priceLabel = `Above ₹${filters.minPrice}`;
            } else if (filters.maxPrice !== undefined) {
                priceLabel = `Under ₹${filters.maxPrice}`;
            }

            activeFilters.push({
                key: 'minPrice',
                label: priceLabel,
                onRemove: () => {
                    onRemoveFilter('minPrice');
                    onRemoveFilter('maxPrice');
                },
            });
        }

        // In stock filter
        if (filters.inStock) {
            activeFilters.push({
                key: 'inStock',
                label: 'In Stock',
                onRemove: () => onRemoveFilter('inStock'),
            });
        }

        // Featured filter
        if (filters.isFeatured) {
            activeFilters.push({
                key: 'isFeatured',
                label: 'Featured',
                onRemove: () => onRemoveFilter('isFeatured'),
            });
        }

        return activeFilters;
    };

    const activeFilters = getActiveFilters();

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
            >
                {activeFilters.map((filter, index) => (
                    <TouchableOpacity
                        key={`${filter.key}-${index}`}
                        style={styles.filterChip}
                        onPress={filter.onRemove}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.filterText}>{filter.label}</Text>
                        <Ionicons name="close" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                ))}

                {activeFilters.length > 1 && (
                    <TouchableOpacity
                        style={styles.clearAllButton}
                        onPress={onClearAll}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        backgroundColor: COLORS.background,
    },
    filtersContainer: {
        paddingHorizontal: SIZES.padding,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight + '20',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
        gap: 6,
    },
    filterText: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.primary,
        fontWeight: SIZES.fontWeight.medium,
    },
    clearAllButton: {
        backgroundColor: COLORS.error + '20',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    clearAllText: {
        fontSize: SIZES.fontSize.small,
        color: COLORS.error,
        fontWeight: SIZES.fontWeight.medium,
    },
});