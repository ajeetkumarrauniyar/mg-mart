import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCategory, ProductFilters } from '@mg-mart/types';
import { COLORS, SIZES, SHADOWS } from '../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: ProductFilters;
    onApplyFilters: (filters: ProductFilters) => void;
    availableCategories: ProductCategory[];
}

const PRICE_RANGES = [
    { label: 'Under ₹50', min: 0, max: 50 },
    { label: '₹50 - ₹100', min: 50, max: 100 },
    { label: '₹100 - ₹200', min: 100, max: 200 },
    { label: '₹200 - ₹500', min: 200, max: 500 },
    { label: 'Above ₹500', min: 500, max: undefined },
];

export const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    filters,
    onApplyFilters,
    availableCategories,
}) => {
    const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleCategorySelect = (category: ProductCategory | undefined) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev };
            if (prev.category === category) {
                delete newFilters.category;
            } else if (category) {
                newFilters.category = category;
            }
            return newFilters;
        });
    };

    const handlePriceRangeSelect = (min: number, max?: number) => {
        const isSelected = localFilters.minPrice === min && localFilters.maxPrice === max;
        setLocalFilters(prev => {
            const newFilters = { ...prev };
            if (isSelected) {
                delete newFilters.minPrice;
                delete newFilters.maxPrice;
            } else {
                newFilters.minPrice = min;
                if (max !== undefined) {
                    newFilters.maxPrice = max;
                } else {
                    delete newFilters.maxPrice;
                }
            }
            return newFilters;
        });
    };

    const handleInStockToggle = () => {
        setLocalFilters(prev => {
            const newFilters = { ...prev };
            if (prev.inStock) {
                delete newFilters.inStock;
            } else {
                newFilters.inStock = true;
            }
            return newFilters;
        });
    };

    const handleFeaturedToggle = () => {
        setLocalFilters(prev => {
            const newFilters = { ...prev };
            if (prev.isFeatured) {
                delete newFilters.isFeatured;
            } else {
                newFilters.isFeatured = true;
            }
            return newFilters;
        });
    };

    const handleClearAll = () => {
        setLocalFilters({});
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (localFilters.category) count++;
        if (localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined) count++;
        if (localFilters.inStock) count++;
        if (localFilters.isFeatured) count++;
        return count;
    };

    const isPriceRangeSelected = (min: number, max?: number) => {
        return localFilters.minPrice === min && localFilters.maxPrice === max;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Filters</Text>
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Categories */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <View style={styles.categoryGrid}>
                            {availableCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryChip,
                                        localFilters.category === category && styles.categoryChipActive,
                                    ]}
                                    onPress={() => handleCategorySelect(category)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            localFilters.category === category && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Price Range */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Price Range</Text>
                        <View style={styles.priceRangeContainer}>
                            {PRICE_RANGES.map((range, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.priceRangeItem,
                                        isPriceRangeSelected(range.min, range.max) && styles.priceRangeItemActive,
                                    ]}
                                    onPress={() => handlePriceRangeSelect(range.min, range.max)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.priceRangeContent}>
                                        <Text
                                            style={[
                                                styles.priceRangeText,
                                                isPriceRangeSelected(range.min, range.max) && styles.priceRangeTextActive,
                                            ]}
                                        >
                                            {range.label}
                                        </Text>
                                        {isPriceRangeSelected(range.min, range.max) && (
                                            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Additional Filters */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Filters</Text>

                        <TouchableOpacity
                            style={styles.toggleItem}
                            onPress={handleInStockToggle}
                            activeOpacity={0.7}
                        >
                            <View style={styles.toggleContent}>
                                <Text style={styles.toggleText}>In Stock Only</Text>
                                <View style={[
                                    styles.toggleSwitch,
                                    localFilters.inStock && styles.toggleSwitchActive,
                                ]}>
                                    <View style={[
                                        styles.toggleThumb,
                                        localFilters.inStock && styles.toggleThumbActive,
                                    ]} />
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toggleItem}
                            onPress={handleFeaturedToggle}
                            activeOpacity={0.7}
                        >
                            <View style={styles.toggleContent}>
                                <Text style={styles.toggleText}>Featured Products</Text>
                                <View style={[
                                    styles.toggleSwitch,
                                    localFilters.isFeatured && styles.toggleSwitchActive,
                                ]}>
                                    <View style={[
                                        styles.toggleThumb,
                                        localFilters.isFeatured && styles.toggleThumbActive,
                                    ]} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApply}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.applyButtonText}>
                            Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: SIZES.fontSize.xlarge,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    clearButtonText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.primary,
        fontWeight: SIZES.fontWeight.medium,
    },
    content: {
        flex: 1,
        paddingHorizontal: SIZES.padding,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: SIZES.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadiusLarge,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
        fontWeight: SIZES.fontWeight.medium,
    },
    categoryChipTextActive: {
        color: COLORS.white,
    },
    priceRangeContainer: {
        gap: 12,
    },
    priceRangeItem: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadiusLarge,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    priceRangeItemActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight + '10',
    },
    priceRangeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    priceRangeText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
        fontWeight: SIZES.fontWeight.medium,
    },
    priceRangeTextActive: {
        color: COLORS.primary,
        fontWeight: SIZES.fontWeight.semibold,
    },
    toggleItem: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadiusLarge,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    toggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    toggleText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.text,
        fontWeight: SIZES.fontWeight.medium,
    },
    toggleSwitch: {
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleSwitchActive: {
        backgroundColor: COLORS.primary,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    footer: {
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.borderRadiusLarge,
        paddingVertical: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    applyButtonText: {
        fontSize: SIZES.fontSize.regular,
        fontWeight: SIZES.fontWeight.semibold,
        color: COLORS.white,
    },
});