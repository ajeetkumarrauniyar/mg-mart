import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ImageSourcePropType } from 'react-native';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const ITEM_WIDTH = (width - (SIZES.padding * 2) - ((COLUMN_COUNT - 1) * 15)) / COLUMN_COUNT;

interface Category {
    id: number;
    name: string;
    image: ImageSourcePropType;
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
                            <Image source={category.image} style={styles.categoryIcon} resizeMode="contain" />
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
        marginBottom: SIZES.marginLarge,
    },
    header: {
        marginBottom: SIZES.margin,
    },
    title: {
        fontSize: SIZES.fontSize.large,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 12,
    },
    categoryItem: {
        width: ITEM_WIDTH,
        alignItems: 'center',
    },
    iconContainer: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderRadius: SIZES.borderRadiusLarge,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.marginSmall,
    },
    categoryIcon: {
        // width: ITEM_WIDTH * 0.6,
        // height: ITEM_WIDTH * 0.6,
        width: '100%',
        height: '100%',
        padding: 5,
    },
    categoryName: {
        fontSize: SIZES.fontSize.tiny,
        color: COLORS.text,
        textAlign: 'center',
        fontWeight: SIZES.fontWeight.semibold,
        lineHeight: 14,
    },
});

export default CategoryGrid;
