import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    ImageSourcePropType,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES, SHADOWS, CATEGORIES } from '@/constants';
import { HomeSearchBar } from '@/components';
import { RootStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// ─── Category definitions ─────────────────────────────────────────────────────

interface Category {
    id: number;
    name: string;
    image: ImageSourcePropType;
    color: string;
}

// ─── Category Card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
    item: Category;
    onPress: (name: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, onPress }) => (
    <TouchableOpacity
        style={[styles.card]}
        onPress={() => onPress(item.name)}
        activeOpacity={0.75}
    >
        <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}>
            <Image source={item.image} style={styles.categoryIcon} resizeMode="contain" />
        </View>
        <Text style={[styles.cardLabel, { color: item.color }]} numberOfLines={2}>
            {item.name}
        </Text>
    </TouchableOpacity>
);

// ─── CategoriesScreen ─────────────────────────────────────────────────────────

export default function CategoriesScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = useCallback((query: string) => {
        if (!query.trim()) return;
        navigation.navigate('Products', { initialQuery: query.trim() });
    }, [navigation]);

    const handleCategoryPress = useCallback((categoryName: string) => {
        navigation.navigate('Products', { category: categoryName });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Shop by Category</Text>
            </View>

            {/* Global Search Bar */}
            <HomeSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmit={handleSearch}
                placeholder="Search 'paneer', 'atta'..."
            />

            {/* 2-column category grid */}
            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.name}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <CategoryCard item={item} onPress={handleCategoryPress} />
                )}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const CARD_SIZE = (Dimensions.get('window').width - SIZES.padding * 2 - 12) / 2;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 16,
        paddingBottom: 4,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: SIZES.fontSize.xlarge,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
    },
    listContent: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 140, // space above floating cart bar
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    card: {
        width: CARD_SIZE,
        height: 120,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
        ...SHADOWS.small,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryIcon: {
        width: 36,
        height: 36,
    },
    cardLabel: {
        fontSize: SIZES.fontSize.small,
        fontWeight: SIZES.fontWeight.semibold,
        lineHeight: 18,
    },
});
