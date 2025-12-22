import React, { useEffect, useState, useMemo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Product, ProductCategory, ProductFilters } from '@mg-mart/types';
import { COLORS, SIZES } from '@/constants';
import { useProductStore, useCartStore, useWishlistStore } from '@/stores';
import { useDebounce, useRequireAuth } from '@/hooks';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { OptimizedImage, SearchBar, FilterModal, CategoryFilter, ActiveFilters } from '@/components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProductsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const {
        products,
        isLoading,
        error,
        fetchProducts,
    } = useProductStore();
    const { addItem } = useCartStore();
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const { requireAuth } = useRequireAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
    const [filters, setFilters] = useState<ProductFilters>({});
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Debounce search query for better performance
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Memoized filtered products for performance
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Apply search query
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase().trim();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category === selectedCategory
            );
        }

        // Apply additional filters from filter modal
        if (filters.category && filters.category !== selectedCategory) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(product => product.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(product => product.price <= filters.maxPrice!);
        }

        if (filters.inStock) {
            filtered = filtered.filter(product => product.stock > 0);
        }

        if (filters.isFeatured) {
            filtered = filtered.filter(product => product.isFeatured);
        }

        return filtered;
    }, [products, debouncedSearchQuery, selectedCategory, filters]);

    // Get unique categories for filter
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        return ['all' as const, ...uniqueCategories];
    }, [products]);

    const availableCategories = useMemo(() => {
        return [...new Set(products.map(p => p.category))];
    }, [products]);


    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        await fetchProducts();
    };

    const handleAddToCart = async (product: Product) => {
        if (product.stock <= 0) {
            Alert.alert('Out of Stock', 'This product is currently unavailable');
            return;
        }

        requireAuth(async () => {
            try {
                await addItem(product.productId, 1);
                Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
            } catch (error) {
                Alert.alert('Error', 'Failed to add item to cart');
            }
        });
    };

    const handleWishlistToggle = (product: Product) => {
        requireAuth(() => {
            toggleWishlist(product);
        });
    };

    const handleApplyFilters = (newFilters: ProductFilters) => {
        setFilters(newFilters);
        // If category filter is applied, sync with category selector
        if (newFilters.category) {
            setSelectedCategory(newFilters.category);
        }
    };

    const handleCategorySelect = (category: ProductCategory | 'all') => {
        setSelectedCategory(category);
        // Clear category from advanced filters if selecting from quick filter
        if (filters.category) {
            setFilters(prev => {
                const newFilters = { ...prev };
                delete newFilters.category;
                return newFilters;
            });
        }
    };

    const handleRemoveFilter = (filterKey: keyof ProductFilters) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[filterKey];
            return newFilters;
        });
    };

    const handleRemoveCategory = () => {
        setSelectedCategory('all');
    };

    const handleClearAllFilters = () => {
        setFilters({});
        setSelectedCategory('all');
    };

    const renderProductCard = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <OptimizedImage
                    source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(item);
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isInWishlist(item.productId) ? "heart" : "heart-outline"}
                        size={18}
                        color={isInWishlist(item.productId) ? "#e53e3e" : "#4a5568"}
                    />
                </TouchableOpacity>
                {item.stock <= 0 && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={styles.productFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.productPrice}>₹{item.price.toFixed(2)}
                            <Text style={styles.productUnit}>
                                /{item.unit}
                            </Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            item.stock <= 0 && styles.addButtonDisabled,
                        ]}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                        }}
                        disabled={item.stock <= 0}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Products</Text>
            <Text style={styles.subtitle}>{filteredProducts.length} items available</Text>

            {/* Search Bar */}
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFilterPress={() => setShowFilterModal(true)}
                style={styles.searchBar}
            />

            {/* Category Filter */}
            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
            />

            {/* Active Filters */}
            <ActiveFilters
                filters={filters}
                selectedCategory={selectedCategory}
                onRemoveFilter={handleRemoveFilter}
                onRemoveCategory={handleRemoveCategory}
                onClearAll={handleClearAllFilters}
            />
        </View>
    );

    const renderFooter = () => {
        if (!isLoading || products.length === 0) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading && products.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.emptyText}>Loading products...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>❌ {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (debouncedSearchQuery.trim() || selectedCategory !== 'all') {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#cbd5e0" />
                    <Text style={styles.emptyText}>No products found</Text>
                    <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                data={filteredProducts}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.productId}
                numColumns={2}
                columnWrapperStyle={styles.row}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={filteredProducts.length === 0 ? styles.emptyList : undefined}
            />

            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                availableCategories={availableCategories}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SIZES.padding,
        paddingTop: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 16,
    },
    searchBar: {
        marginBottom: 16,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        marginTop: 16,
    },
    productCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 140,
        backgroundColor: '#f8f9fa',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 18,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 18,
    },
    productUnit: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 8,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    priceContainer: {
        flex: 1,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    addButtonDisabled: {
        backgroundColor: '#e2e8f0',
        elevation: 0,
        shadowOpacity: 0,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '600',
        lineHeight: 22,
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#e53e3e',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: SIZES.fontSize.large,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textSecondary,
    },
    errorText: {
        fontSize: SIZES.fontSize.medium,
        color: '#e53e3e',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: SIZES.borderRadius,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.medium,
        fontWeight: '600',
    },
});
