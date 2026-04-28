import { useEffect, useState } from 'react'
import { imageManagementService, productService } from '../services'
import type {
    Product,
    ProductListResponse,
    CreateProductData,
    ImageManagementHealth,
    ImageManagementStatistics
} from '../services'
import { ProductModal } from './ProductModal'
import { ConfirmDialog } from './ConfirmDialog'
import { ProductDetail } from './ProductDetail'

export function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
    const [detailProductId, setDetailProductId] = useState<string | null>(null)
    const [imageStats, setImageStats] = useState<ImageManagementStatistics | null>(null)
    const [imageHealth, setImageHealth] = useState<ImageManagementHealth | null>(null)
    const [imageOpsLoading, setImageOpsLoading] = useState(false)
    const [imageOpsError, setImageOpsError] = useState<string | null>(null)
    const [cleanupMessage, setCleanupMessage] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false
    })

    useEffect(() => {
        void loadProducts()
        void loadImageManagementOverview()
    }, [])

    const getErrorMessage = (err: unknown, fallback: string): string => {
        if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            return err.message
        }
        return fallback
    }

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

    const loadImageManagementOverview = async () => {
        try {
            setImageOpsLoading(true)
            setImageOpsError(null)
            const [stats, health] = await Promise.all([
                imageManagementService.getStatistics(),
                imageManagementService.getHealth()
            ])
            setImageStats(stats)
            setImageHealth(health)
        } catch (err) {
            setImageOpsError(getErrorMessage(err, 'Failed to load image management overview'))
        } finally {
            setImageOpsLoading(false)
        }
    }

    const handleCleanupTemporaryImages = async () => {
        try {
            setImageOpsLoading(true)
            setImageOpsError(null)
            setCleanupMessage(null)
            const response = await imageManagementService.cleanupTemporaryImages()
            setCleanupMessage(response.message || 'Cleanup completed')
            await loadImageManagementOverview()
        } catch (err) {
            setImageOpsError(getErrorMessage(err, 'Failed to cleanup temporary images'))
        } finally {
            setImageOpsLoading(false)
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

    const handleViewProduct = (product: Product) => {
        setDetailProductId(product.productId)
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

            <div className="image-management-summary">
                <div className="image-summary-header">
                    <h3>Image Management System</h3>
                    <div className="image-summary-actions">
                        <button
                            className="image-summary-btn"
                            onClick={() => void loadImageManagementOverview()}
                            disabled={imageOpsLoading}
                        >
                            Refresh
                        </button>
                        <button
                            className="image-summary-btn danger"
                            onClick={() => void handleCleanupTemporaryImages()}
                            disabled={imageOpsLoading}
                        >
                            Cleanup Temporary Images
                        </button>
                    </div>
                </div>
                {imageOpsLoading && <p>Loading image management overview...</p>}
                {imageOpsError && <p className="summary-error">{imageOpsError}</p>}
                {cleanupMessage && <p className="summary-success">{cleanupMessage}</p>}
                <div className="image-summary-grid">
                    <div className="image-summary-item">
                        <span className="label">Health</span>
                        <span className="value">{imageHealth?.status || 'Unknown'}</span>
                    </div>
                    <div className="image-summary-item">
                        <span className="label">Total Images</span>
                        <span className="value">
                            {typeof imageStats?.totalImages === 'number' ? imageStats.totalImages : '-'}
                        </span>
                    </div>
                    <div className="image-summary-item">
                        <span className="label">Pending Approvals</span>
                        <span className="value">
                            {typeof imageStats?.pendingApprovals === 'number' ? imageStats.pendingApprovals : '-'}
                        </span>
                    </div>
                    <div className="image-summary-item">
                        <span className="label">Failed Processing</span>
                        <span className="value">
                            {typeof imageStats?.failedProcessing === 'number' ? imageStats.failedProcessing : '-'}
                        </span>
                    </div>
                </div>
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
                                        className="view-btn"
                                        onClick={() => handleViewProduct(product)}
                                    >
                                        View
                                    </button>
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

            {detailProductId && (
                <ProductDetail
                    productId={detailProductId}
                    onClose={() => setDetailProductId(null)}
                />
            )}
        </div>
    )
}
