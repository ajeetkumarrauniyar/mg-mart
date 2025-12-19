import { useEffect, useState } from 'react'
import { productService } from '../services'
import type { Product, ProductListResponse, CreateProductData } from '../services'
import { ProductModal } from './ProductModal'
import { ConfirmDialog } from './ConfirmDialog'

export function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false
    })

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            setLoading(true)
            setError(null)
            const response: ProductListResponse = await productService.getProducts()
            setProducts(response.products)
            setPagination(response.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products')
            console.error('Products loading error:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleAddProduct = () => {
        setSelectedProduct(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleDeleteProduct = (product: Product) => {
        setDeleteProduct(product)
    }

    const confirmDeleteProduct = async () => {
        if (!deleteProduct) return

        try {
            await productService.deleteProduct(deleteProduct.productId)
            // Refresh the products list
            await loadProducts()
            setDeleteProduct(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product')
            console.error('Product deletion error:', err)
        }
    }

    const handleSaveProduct = async (productData: CreateProductData) => {
        if (modalMode === 'create') {
            await productService.createProduct(productData)
        } else if (selectedProduct) {
            await productService.updateProduct(selectedProduct.productId, productData)
        }

        // Refresh the products list
        await loadProducts()
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedProduct(null)
    }

    if (loading) {
        return (
            <div className="products-container">
                <div className="loading">Loading products...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="products-container">
                <div className="error">
                    <p>Error: {error}</p>
                    <button onClick={loadProducts} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="products-container">
            <div className="products-header">
                <h2>Products ({pagination.total})</h2>
                <button className="add-product-btn" onClick={handleAddProduct}>
                    Add Product
                </button>
            </div>

            {products.length === 0 ? (
                <div className="empty-state">
                    <p>No products found</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product.productId} className="product-card">
                            <div className="product-image">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/200x150?text=No+Image'
                                        }}
                                    />
                                ) : (
                                    <div className="placeholder-image">No Image</div>
                                )}
                            </div>

                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-description">{product.description}</p>

                                <div className="product-details">
                                    <div className="price-stock">
                                        <span className="price">{formatCurrency(product.price)}</span>
                                        <span className="stock">Stock: {product.stock} {product.unit}</span>
                                    </div>

                                    <div className="category-featured">
                                        <span className="category">{product.category}</span>
                                        {product.isFeatured && (
                                            <span className="featured-badge">Featured</span>
                                        )}
                                    </div>
                                </div>

                                <div className="product-meta">
                                    <small>Created: {formatDate(product.createdAt)}</small>
                                    <small>Updated: {formatDate(product.updatedAt)}</small>
                                </div>

                                <div className="product-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditProduct(product)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteProduct(product)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination.hasMore && (
                <div className="load-more">
                    <button onClick={loadProducts} className="load-more-btn">
                        Load More Products
                    </button>
                </div>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveProduct}
                product={selectedProduct}
                mode={modalMode}
            />

            <ConfirmDialog
                isOpen={!!deleteProduct}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
                onConfirm={confirmDeleteProduct}
                onCancel={() => setDeleteProduct(null)}
                confirmText="Delete"
                type="danger"
            />
        </div>
    )
}