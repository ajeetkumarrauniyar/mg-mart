import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const ITEM_WIDTH = (width - (SIZES.padding * 2) - ((COLUMN_COUNT - 1) * 15)) / COLUMN_COUNT;

interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
}

interface CategoryGridProps {
    categories: Category[];
    onCategoryPress: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Shop by Category</Text>
            </View>
            <View style={styles.grid}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.categoryItem}
                        onPress={() => onCategoryPress(category)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: category.color + '15' }]}>
                            <Text style={styles.emoji}>{category.icon}</Text>
                        </View>
                        <Text style={styles.categoryName} numberOfLines={2}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: SIZES.fontSize.large,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 15,
    },
    categoryItem: {
        width: ITEM_WIDTH,
        alignItems: 'center',
    },
    iconContainer: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
        marginBottom: 8,
    },
    emoji: {
        fontSize: ITEM_WIDTH * 0.5,
    },
    categoryName: {
        fontSize: 11,
        color: COLORS.text,
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 14,
    },
});

export default CategoryGrid;
