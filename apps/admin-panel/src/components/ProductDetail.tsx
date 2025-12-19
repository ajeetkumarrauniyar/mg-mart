import { useEffect, useState } from 'react'
import { productService } from '../services'
import type { Product } from '../services'

interface ProductDetailProps {
    productId: string
    onClose: () => void
}

export function ProductDetail({ productId, onClose }: ProductDetailProps) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadProduct()
    }, [productId])

    const loadProduct = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await productService.getProduct(productId)
            setProduct(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load product')
            console.error('Product loading error:', err)
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
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="loading">Loading product details...</div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="error">
                        <p>Error: {error || 'Product not found'}</p>
                        <button onClick={loadProduct} className="retry-btn">
                            Retry
                        </button>
                        <button onClick={onClose} className="close-btn">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content product-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    ×
                </button>

                <div className="product-detail-content">
                    <div className="product-detail-image">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'
                                }}
                            />
                        ) : (
                            <div className="placeholder-image-large">No Image Available</div>
                        )}
                    </div>

                    <div className="product-detail-info">
                        <div className="product-detail-header">
                            <h2>{product.name}</h2>
                            {product.isFeatured && (
                                <span className="featured-badge-large">⭐ Featured</span>
                            )}
                        </div>

                        <div className="product-detail-price">
                            <span className="price-label">Price:</span>
                            <span className="price-value">{formatCurrency(product.price)}</span>
                            <span className="price-unit">per {product.unit}</span>
                        </div>

                        <div className="product-detail-section">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="product-detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Product ID:</span>
                                <span className="detail-value">{product.productId}</span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Category:</span>
                                <span className="detail-value">{product.category}</span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Stock:</span>
                                <span className="detail-value stock-value">
                                    {product.stock} {product.unit}
                                    {product.stock < 20 && (
                                        <span className="low-stock-warning"> ⚠️ Low Stock</span>
                                    )}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Unit:</span>
                                <span className="detail-value">{product.unit}</span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Created:</span>
                                <span className="detail-value">{formatDate(product.createdAt)}</span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Last Updated:</span>
                                <span className="detail-value">{formatDate(product.updatedAt)}</span>
                            </div>
                        </div>

                        <div className="product-detail-actions">
                            <button className="edit-btn-large">Edit Product</button>
                            <button className="delete-btn-large">Delete Product</button>
                            <button onClick={onClose} className="cancel-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}