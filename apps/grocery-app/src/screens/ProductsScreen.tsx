import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Product, ProductCategory, ProductFilters } from '@mg-mart/types';
import { COLORS, SIZES } from '@/constants';
import { useProductStore, useCartStore } from '@/stores';
import { useDebounce, useRequireAuth } from '@/hooks';
import { RootStackParamList } from '@/navigation/AppNavigator';
import {
    SearchBar,
    FilterModal,
    CategoryFilter,
    ActiveFilters,
    QuickAddProductCard,
    ScreenContainer,
    AppHeader,
    AnimatedCartBadge,
} from '@/components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProductsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const {
        products,
        isLoading,
        isFetchingMore,
        hasMore,
        error,
        fetchProducts,
        loadMoreProducts,
    } = useProductStore();
    const { addItem, totalItems } = useCartStore();
    const { requireAuth } = useRequireAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
    const [filters, setFilters] = useState<ProductFilters>({});
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Categories list
    const categories: (ProductCategory | 'all')[] = useMemo(() => [
        'all',
        'Vegetables',
        'Fruits',
        'Dairy',
        'Meat',
        'Bakery',
        'Beverages',
    ] as (ProductCategory | 'all')[], []);

    const availableCategories = useMemo(() =>
        categories.filter((c) => c !== 'all') as ProductCategory[]
        , [categories]);

    // Initial load
    useEffect(() => {
        const loadInitial = async () => {
            await fetchProducts();
            setIsFirstLoad(false);
        };
        loadInitial();
    }, []);

    // Re-fetch on search/category change
    useEffect(() => {
        if (!isFirstLoad) {
            const params: Parameters<typeof fetchProducts>[0] = {};
            if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();
            if (selectedCategory !== 'all') params.category = selectedCategory;
            fetchProducts(params);
        }
    }, [debouncedSearchQuery, selectedCategory]);

    const handleApplyFilters = (newFilters: ProductFilters) => {
        setFilters(newFilters);
        if (newFilters.category) {
            setSelectedCategory(newFilters.category);
        }
    };

    const handleCategorySelect = (category: ProductCategory | 'all') => {
        setSelectedCategory(category);
    };

    const handleClearAllFilters = () => {
        setFilters({});
        setSelectedCategory('all');
        setSearchQuery('');
    };

    const onEndReached = () => {
        if (hasMore && !isFetchingMore && !isLoading) {
            loadMoreProducts();
        }
    };

    const renderProductCard = ({ item }: { item: Product }) => (
        <View style={styles.cardContainer}>
            <QuickAddProductCard
                product={item}
                style={styles.fullWidthCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
            />
        </View>
    );

    const renderHeader = () => (
        <View style={styles.listHeader}>
            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
            />
            {Object.keys(filters).length > 0 && (
                <ActiveFilters
                    filters={filters}
                    selectedCategory={selectedCategory}
                    onRemoveFilter={() => { }}
                    onRemoveCategory={() => setSelectedCategory('all')}
                    onClearAll={handleClearAllFilters}
                />
            )}
        </View>
    );

    const renderFooter = () => {
        if (!isFetchingMore) return <View style={styles.footerSpacing} />;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading && products.length === 0) return null; // Showing skeleton instead

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No products found</Text>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearAllFilters}>
                    <Text style={styles.clearButtonText}>Clear all filters</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <ScreenContainer
            header={
                <View>
                    <AppHeader
                        title="MG Mart Store"
                        showBackButton={false}
                        rightAction={
                            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}>
                                <View style={styles.cartIconContainer}>
                                    <Ionicons name="cart-outline" size={SIZES.icon.large || 24} color={COLORS.text} />
                                    <AnimatedCartBadge count={totalItems} />
                                </View>
                            </TouchableOpacity>
                        }
                    />
                    <View style={styles.searchHeader}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFilterPress={() => setShowFilterModal(true)}
                            style={styles.searchBar}
                        />
                    </View>
                </View>
            }
            scrollable={false}
            bottomTabOffset
        >
            <FlatList
                data={products}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.productId}
                numColumns={2}
                columnWrapperStyle={styles.row}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                contentContainerStyle={styles.listContent}
            />

            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                availableCategories={availableCategories}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    searchHeader: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
        zIndex: 5,
    },
    searchBar: {
        marginTop: 10,
    },
    listHeader: {
        backgroundColor: COLORS.white,
        paddingTop: 8,
    },
    listContent: {
        paddingBottom: 120,
        paddingTop: SIZES.marginSmall,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        marginTop: SIZES.margin,
    },
    cardContainer: {
        width: '48%',
    },
    fullWidthCard: {
        width: '100%',
        marginRight: 0,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerSpacing: {
        height: 40,
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
    },
    emptyText: {
        fontSize: SIZES.fontSize.regular,
        color: COLORS.textSecondary,
        marginTop: SIZES.margin,
        marginBottom: SIZES.margin,
        textAlign: 'center',
    },
    clearButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.paddingSmall,
        borderRadius: SIZES.borderRadius,
    },
    clearButtonText: {
        color: COLORS.white,
        fontWeight: SIZES.fontWeight.bold,
        fontSize: SIZES.fontSize.medium,
    },
    cartIconContainer: {
        padding: 4,
    },
});
