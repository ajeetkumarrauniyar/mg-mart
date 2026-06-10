import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { imageManagementService, productService } from '../services'
import type { Product, ProductImage, ProcessingStatusResponse } from '../services'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    void loadProduct()
    void refreshImageManagementData()
    return () => stopPolling()
  }, [productId])

  // Auto-poll while status is in_progress
  useEffect(() => {
    if (processingStatus?.status === 'in_progress' || processingStatus?.status === 'pending') {
      startPolling()
    } else {
      stopPolling()
    }
  }, [processingStatus?.status])

  const startPolling = () => {
    if (pollIntervalRef.current) return // already polling
    pollIntervalRef.current = setInterval(() => {
      // Silent poll — never triggers imagesLoading skeleton so the grid doesn't flicker
      void loadProcessingStatusSilent()
      void loadProductImagesSilent()
    }, 3000)
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  /* ─── data helpers ─────────────────────────────────────────── */

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string')
      return err.message
    return fallback
  }

  const getImageId = (image: ProductImage, index: number): string =>
    image.imageId || image.id || `image-${index}`

  const getImageUrl = (image: ProductImage): string =>
    image.imageUrl || image.url || ''

  /* ─── loaders ──────────────────────────────────────────────── */

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProduct(productId)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  // Silent version used by auto-poll — no loading spinner, no collapse
  const loadProductImagesSilent = async () => {
    try {
      const images = await imageManagementService.getProductImages(productId)
      setProductImages(images)
    } catch {
      // Silently ignore poll errors
    }
  }

  const loadProcessingStatusSilent = async () => {
    try {
      const status = await imageManagementService.getProcessingStatus(productId)
      setProcessingStatus(status)
    } catch {
      // Silently ignore poll errors
    }
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
      setImageActionError(getErrorMessage(err, 'Failed to load processing status'))
    }
  }

  const refreshImageManagementData = async () => {
    setImageActionError(null)
    await Promise.all([loadProductImages(), loadProcessingStatus()])
  }

  /* ─── image actions ────────────────────────────────────────── */

  const runImageAction = async (key: string, action: () => Promise<void>) => {
    try {
      setImageActionLoading(key)
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
    // Don't re-trigger if already running
    if (processingStatus?.status === 'in_progress' || processingStatus?.status === 'pending') {
      setImageActionMessage('Image discovery is already in progress — polling for updates…')
      return
    }
    await runImageAction('discover', async () => {
      try {
        const res = await imageManagementService.discoverImages(productId)
        setImageActionMessage(res.message || 'Image discovery started')
      } catch (err: unknown) {
        // 409 = already running — treat as info, not error
        const status = (err as { status?: number; response?: { status?: number } })?.status
          ?? (err as { status?: number; response?: { status?: number } })?.response?.status
        if (status === 409) {
          setImageActionMessage('Image discovery is already in progress — polling for updates…')
          return
        }
        throw err
      }
      await loadProcessingStatus()
    })
  }

  //   const handleRetryProcessing = () =>
  //     runImageAction('retry', async () => {
  //       const res = await imageManagementService.retryProcessing(productId)
  //       setProcessingStatus(res)
  //       setImageActionMessage(res.message || 'Retry requested')
  //     })

  const handleApproveSelected = () =>
    runImageAction('approve', async () => {
      if (selectedImageIds.length === 0) return
      const res = await imageManagementService.approveImages(productId, {
        imageIds: selectedImageIds,
      })
      setImageActionMessage(res.message || 'Selected images approved')
      setSelectedImageIds([])
      await loadProductImages()
    })

  const handleDeleteImage = (imageId: string) => {
    if (!window.confirm('Delete this image from the product?')) return
    void runImageAction(`delete-${imageId}`, async () => {
      const res = await imageManagementService.deleteProductImage(productId, imageId)
      setImageActionMessage(res.message || 'Image deleted')
      setSelectedImageIds((cur) => cur.filter((id) => id !== imageId))
      await loadProductImages()
    })
  }

  const handleSetPrimary = (imageId: string) =>
    runImageAction(`primary-${imageId}`, async () => {
      const res = await imageManagementService.setPrimaryImage(productId, imageId)
      setImageActionMessage(res.message || 'Primary image updated')
      await Promise.all([loadProductImages(), loadProduct()])
    })

  const toggleSelection = (imageId: string) =>
    setSelectedImageIds((cur) =>
      cur.includes(imageId) ? cur.filter((id) => id !== imageId) : [...cur, imageId],
    )

  /* ─── formatters ───────────────────────────────────────────── */

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

  const formatDate = (s: string) =>
    new Date(s).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const stockState = product
    ? product.stock <= 0
      ? 'out'
      : product.stock <= 10
        ? 'low'
        : 'ok'
    : 'ok'

  const statusColor =
    processingStatus?.status === 'completed'
      ? 'default'
      : processingStatus?.status === 'processing'
        ? 'secondary'
        : processingStatus?.status === 'failed'
          ? 'destructive'
          : 'outline'

  /* ─── render ───────────────────────────────────────────────── */

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-3xl w-full p-0 gap-0 overflow-hidden" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {loading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <DialogTitle className="text-lg font-semibold leading-tight truncate">
                  {product?.name ?? 'Product Details'}
                </DialogTitle>
              )}
              {!loading && product && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  SKU: {product.productId.slice(-12)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -mt-1 -mr-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Separator className="mt-4" />

        {/* Error state */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p>{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => void loadProduct()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="max-h-[calc(100vh-12rem)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="images">
                  Images
                  {productImages.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                      {productImages.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── Tab: Overview ── */}
              <TabsContent value="overview" className="mt-4 space-y-5">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : product ? (
                  <>
                    {/* Hero image + price row */}
                    <div className="flex gap-4">
                      <div className="h-32 w-32 shrink-0 rounded-xl border bg-muted overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline">{product.category}</Badge>
                          {product.isFeatured && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3 fill-current" /> Featured
                            </Badge>
                          )}
                          <Badge
                            variant={
                              stockState === 'ok'
                                ? 'default'
                                : stockState === 'low'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {stockState === 'ok'
                              ? 'In Stock'
                              : stockState === 'low'
                                ? 'Low Stock'
                                : 'Out of Stock'}
                          </Badge>
                        </div>

                        <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-muted-foreground">
                          per {product.unit} · {product.stock} {product.unit} available
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Description
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {product.description || 'No description provided.'}
                      </p>
                    </div>

                    <Separator />

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { label: 'Product ID', value: product.productId },
                        { label: 'Unit', value: product.unit },
                        { label: 'Stock', value: `${product.stock} ${product.unit}` },
                        { label: 'Category', value: product.category },
                        { label: 'Created', value: formatDate(product.createdAt) },
                        { label: 'Last Updated', value: formatDate(product.updatedAt) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium mt-0.5 truncate" title={value}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </TabsContent>

              {/* ── Tab: Images ── */}
              <TabsContent value="images" className="mt-4 space-y-4">
                {/* Processing status bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Processing Status</p>
                    <Badge variant={statusColor} className="capitalize">
                      {processingStatus?.status ?? 'Unknown'}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={imageActionLoading !== null}
                    onClick={() => void refreshImageManagementData()}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      imageActionLoading !== null ||
                      processingStatus?.status === 'in_progress' ||
                      processingStatus?.status === 'pending'
                    }
                    onClick={() => void handleDiscoverImages()}
                  >
                    {imageActionLoading === 'discover' ? (
                      <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Discovering…</>
                    ) : (
                      <><Search className="h-3.5 w-3.5 mr-1.5" />Discover Images</>
                    )}
                  </Button>

                  {/* <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      imageActionLoading !== null ||
                      processingStatus?.status !== 'failed'
                    }
                    title={
                      processingStatus?.status !== 'failed'
                        ? `Retry is only available when status is 'failed' (current: ${processingStatus?.status ?? 'unknown'})`
                        : undefined
                    }
                    onClick={() => void handleRetryProcessing()}
                  >
                    {imageActionLoading === 'retry' ? (
                      <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Retrying…</>
                    ) : (
                      <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Retry Processing</>
                    )}
                  </Button> */}

                  {selectedImageIds.length > 0 && (
                    <Button
                      size="sm"
                      disabled={imageActionLoading !== null}
                      onClick={() => void handleApproveSelected()}
                    >
                      {imageActionLoading === 'approve' ? (
                        <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Approving…</>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          Approve {selectedImageIds.length} Selected
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Inline feedback */}
                {imageActionError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{imageActionError}</span>
                  </div>
                )}
                {imageActionMessage && (
                  <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{imageActionMessage}</span>
                  </div>
                )}

                {/* Image grid */}
                {imagesLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-video rounded-lg" />
                    ))}
                  </div>
                ) : productImages.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No product images found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDiscoverImages()}
                        disabled={imageActionLoading !== null}
                      >
                        Discover Images
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {productImages.map((image, index) => {
                      const imageId = getImageId(image, index)
                      const imageUrl = getImageUrl(image)
                      const isPrimary = Boolean(image.isPrimary)
                      const isSelected = selectedImageIds.includes(imageId)

                      return (
                        <div
                          key={imageId}
                          onClick={() => toggleSelection(imageId)}
                          className={`group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${isSelected
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/40'
                            }`}
                        >
                          {/* Image */}
                          <div className="aspect-video bg-muted">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="absolute top-1.5 left-1.5 flex gap-1">
                            {isPrimary && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500 hover:bg-green-500">
                                Primary
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4">Selected</Badge>
                            )}
                          </div>

                          {/* Status chip */}
                          <div className="px-2 py-1.5 bg-card border-t">
                            <p className="text-[10px] text-muted-foreground truncate">
                              {image.status ?? 'unknown'} · {image.source ?? '—'}
                            </p>
                          </div>

                          {/* Hover actions */}
                          <div
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!isPrimary && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-xs"
                                disabled={imageActionLoading !== null}
                                onClick={() => void handleSetPrimary(imageId)}
                              >
                                {imageActionLoading === `primary-${imageId}` ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Set Primary'
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs"
                              disabled={imageActionLoading !== null}
                              onClick={() => handleDeleteImage(imageId)}
                            >
                              {imageActionLoading === `delete-${imageId}` ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            disabled={loading}
            onClick={() => void loadProduct()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
