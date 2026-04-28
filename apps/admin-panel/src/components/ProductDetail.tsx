import { useEffect, useState } from 'react'
import { imageManagementService, productService } from '../services'
import type { Product, ProductImage, ProcessingStatusResponse } from '../services'

interface ProductDetailProps {
    productId: string
    onClose: () => void
}

export function ProductDetail({ productId, onClose }: ProductDetailProps) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [imagesLoading, setImagesLoading] = useState(false)
    const [productImages, setProductImages] = useState<ProductImage[]>([])
    const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])
    const [processingStatus, setProcessingStatus] = useState<ProcessingStatusResponse | null>(null)
    const [imageActionLoading, setImageActionLoading] = useState<string | null>(null)
    const [imageActionError, setImageActionError] = useState<string | null>(null)
    const [imageActionMessage, setImageActionMessage] = useState<string | null>(null)

    useEffect(() => {
        void loadProduct()
        void refreshImageManagementData()
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

    const getImageId = (image: ProductImage, index: number): string => {
        return image.imageId || image.id || `image-${index}`
    }

    const getImageUrl = (image: ProductImage): string => {
        return image.imageUrl || image.url || ''
    }

    const getErrorMessage = (err: unknown, fallback: string): string => {
        if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            return err.message
        }
        return fallback
    }

    const loadProductImages = async () => {
        try {
            setImagesLoading(true)
            const images = await imageManagementService.getProductImages(productId)
            setProductImages(images)
        } catch (err) {
            setImageActionError(getErrorMessage(err, 'Failed to load product images'))
        } finally {
            setImagesLoading(false)
        }
    }

    const loadProcessingStatus = async () => {
        try {
            const status = await imageManagementService.getProcessingStatus(productId)
            setProcessingStatus(status)
        } catch (err) {
            setImageActionError(getErrorMessage(err, 'Failed to load image processing status'))
        }
    }

    const refreshImageManagementData = async () => {
        setImageActionError(null)
        await Promise.all([loadProductImages(), loadProcessingStatus()])
    }

    const runImageAction = async (
        actionKey: string,
        action: () => Promise<void>
    ) => {
        try {
            setImageActionLoading(actionKey)
            setImageActionError(null)
            setImageActionMessage(null)
            await action()
        } catch (err) {
            setImageActionError(getErrorMessage(err, 'Image operation failed'))
        } finally {
            setImageActionLoading(null)
        }
    }

    const handleDiscoverImages = async () => {
        await runImageAction('discover', async () => {
            const response = await imageManagementService.discoverImages(productId)
            setImageActionMessage(response.message || 'Image discovery started')
            await loadProcessingStatus()
        })
    }

    const handleRetryProcessing = async () => {
        await runImageAction('retry', async () => {
            const response = await imageManagementService.retryProcessing(productId)
            setProcessingStatus(response)
            setImageActionMessage(response.message || 'Image processing retry requested')
        })
    }

    const handleApproveSelectedImages = async () => {
        if (selectedImageIds.length === 0) return

        await runImageAction('approve', async () => {
            const response = await imageManagementService.approveImages(productId, {
                imageIds: selectedImageIds
            })
            setImageActionMessage(response.message || 'Selected images approved')
            setSelectedImageIds([])
            await loadProductImages()
        })
    }

    const handleDeleteImage = async (imageId: string) => {
        if (!window.confirm('Delete this image from the product?')) return

        await runImageAction(`delete-${imageId}`, async () => {
            const response = await imageManagementService.deleteProductImage(productId, imageId)
            setImageActionMessage(response.message || 'Image deleted')
            setSelectedImageIds((current) => current.filter((id) => id !== imageId))
            await loadProductImages()
        })
    }

    const handleSetPrimaryImage = async (imageId: string) => {
        await runImageAction(`primary-${imageId}`, async () => {
            const response = await imageManagementService.setPrimaryImage(productId, imageId)
            setImageActionMessage(response.message || 'Primary image updated')
            await Promise.all([loadProductImages(), loadProduct()])
        })
    }

    const toggleImageSelection = (imageId: string) => {
        setSelectedImageIds((current) => {
            if (current.includes(imageId)) {
                return current.filter((id) => id !== imageId)
            }
            return [...current, imageId]
        })
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

                        <div className="image-management-section">
                            <div className="image-management-header">
                                <h3>Image Management</h3>
                                <span className="processing-status-badge">
                                    Status: {processingStatus?.status || 'Unknown'}
                                </span>
                            </div>

                            <div className="image-management-controls">
                                <button
                                    className="image-action-btn"
                                    onClick={handleDiscoverImages}
                                    disabled={imageActionLoading !== null}
                                >
                                    {imageActionLoading === 'discover' ? 'Discovering...' : 'Discover Images'}
                                </button>
                                <button
                                    className="image-action-btn"
                                    onClick={() => void loadProcessingStatus()}
                                    disabled={imageActionLoading !== null}
                                >
                                    Refresh Status
                                </button>
                                <button
                                    className="image-action-btn"
                                    onClick={handleRetryProcessing}
                                    disabled={imageActionLoading !== null}
                                >
                                    {imageActionLoading === 'retry' ? 'Retrying...' : 'Retry Processing'}
                                </button>
                                <button
                                    className="image-action-btn"
                                    onClick={() => void loadProductImages()}
                                    disabled={imageActionLoading !== null}
                                >
                                    Refresh Images
                                </button>
                                <button
                                    className="image-action-btn approve-btn"
                                    onClick={handleApproveSelectedImages}
                                    disabled={imageActionLoading !== null || selectedImageIds.length === 0}
                                >
                                    {imageActionLoading === 'approve'
                                        ? 'Approving...'
                                        : `Approve Selected (${selectedImageIds.length})`}
                                </button>
                            </div>

                            {imageActionError && (
                                <div className="inline-error">{imageActionError}</div>
                            )}

                            {imageActionMessage && (
                                <div className="inline-success">{imageActionMessage}</div>
                            )}

                            {imagesLoading ? (
                                <div className="loading">Loading product images...</div>
                            ) : productImages.length === 0 ? (
                                <div className="empty-state compact-empty">
                                    <p>No product images found</p>
                                </div>
                            ) : (
                                <div className="managed-images-grid">
                                    {productImages.map((image, index) => {
                                        const imageId = getImageId(image, index)
                                        const imageUrl = getImageUrl(image)
                                        const isPrimary = Boolean(image.isPrimary)
                                        const isSelected = selectedImageIds.includes(imageId)

                                        return (
                                            <div className="managed-image-card" key={imageId}>
                                                <label className="image-select-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleImageSelection(imageId)}
                                                    />
                                                    Select
                                                </label>
                                                <div className="managed-image-preview">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={`${product.name} image ${index + 1}`}
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/260x180?text=Image+Unavailable'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="placeholder-image">No Image URL</div>
                                                    )}
                                                </div>
                                                <div className="managed-image-meta">
                                                    <small>ID: {imageId}</small>
                                                    <small>Status: {image.status || 'Unknown'}</small>
                                                    <small>Source: {image.source || 'Unknown'}</small>
                                                </div>
                                                <div className="managed-image-actions">
                                                    <button
                                                        className="image-action-btn"
                                                        disabled={isPrimary || imageActionLoading !== null}
                                                        onClick={() => handleSetPrimaryImage(imageId)}
                                                    >
                                                        {isPrimary
                                                            ? 'Primary'
                                                            : imageActionLoading === `primary-${imageId}`
                                                                ? 'Setting...'
                                                                : 'Set Primary'}
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        disabled={imageActionLoading !== null}
                                                        onClick={() => handleDeleteImage(imageId)}
                                                    >
                                                        {imageActionLoading === `delete-${imageId}` ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="product-detail-actions">
                            <button className="edit-btn-large" onClick={() => void loadProduct()}>
                                Refresh Product
                            </button>
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
