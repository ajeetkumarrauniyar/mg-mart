import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ImageIcon,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import {
  buildDisplayImages,
  imageManagementService,
  productService,
} from '../services'
import type {
  DisplayImage,
  ProcessingStatusResponse,
  Product,
} from '../services'
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

const STAGES = ['discovery', 'approval_pending', 'processing', 'storage', 'completed'] as const
type StageName = typeof STAGES[number]

const STAGE_LABELS: Record<StageName, { title: string; description: string }> = {
  discovery: {
    title: 'Discovery',
    description: 'Searching search engines for product images.'
  },
  approval_pending: {
    title: 'Approval',
    description: 'Awaiting candidate selection by user.'
  },
  processing: {
    title: 'Processing',
    description: 'Optimizing and enhancing quality.'
  },
  storage: {
    title: 'Storage',
    description: 'Uploading to Cloudinary storage.'
  },
  completed: {
    title: 'Complete',
    description: 'Images attached to product.'
  }
}

export function ProductDetail({ productId, onClose }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imagesLoading, setImagesLoading] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusResponse | null>(null)
  const [storedImageCount, setStoredImageCount] = useState(0)
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])
  const [imageActionLoading, setImageActionLoading] = useState<string | null>(null)
  const [imageActionError, setImageActionError] = useState<string | null>(null)
  const [imageActionMessage, setImageActionMessage] = useState<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [storedImages, setStoredImages] = useState<Awaited<ReturnType<typeof imageManagementService.getProductImages>>>([])
  const allDisplayImages = useMemo(
    () => buildDisplayImages(storedImages, processingStatus),
    [storedImages, processingStatus],
  )

  const isPolling =
    processingStatus?.status === 'in_progress' ||
    processingStatus?.status === 'pending' ||
    processingStatus?.stage === 'processing'

  const getFailedStage = (): string | null => {
    if (!processingStatus || processingStatus.status !== 'failed') return null
    if (processingStatus.stage !== 'failed') return processingStatus.stage
    const errors = processingStatus.errors || []
    if (errors.length > 0) {
      const lastError = errors[errors.length - 1]
      if (lastError && lastError.stage) {
        return lastError.stage
      }
    }
    if (processingStatus.approvedImages && processingStatus.approvedImages.length > 0) {
      return 'processing'
    }
    return 'discovery'
  }

  const getStepState = (stepStage: string): 'pending' | 'active' | 'completed' | 'failed' => {
    if (!processingStatus) return 'pending'
    const currentStatus = processingStatus.status
    const currentStage = processingStatus.stage

    if (currentStatus === 'completed') {
      return 'completed'
    }

    const failedStage = getFailedStage()
    if (currentStatus === 'failed') {
      if (stepStage === failedStage) {
        return 'failed'
      }
      const failedIndex = STAGES.indexOf(failedStage as StageName)
      const stepIndex = STAGES.indexOf(stepStage as StageName)
      if (stepIndex < failedIndex) {
        return 'completed'
      }
      return 'pending'
    }

    const activeStage = currentStage === 'failed' ? 'discovery' : currentStage
    const activeIndex = STAGES.indexOf(activeStage as StageName)
    const stepIndex = STAGES.indexOf(stepStage as StageName)

    if (stepIndex < activeIndex) {
      return 'completed'
    }
    if (stepIndex === activeIndex) {
      if (activeStage === 'approval_pending') {
        return 'active'
      }
      if (currentStatus === 'in_progress' || currentStatus === 'pending') {
        return 'active'
      }
      return 'completed'
    }
    return 'pending'
  }

  const handleRefreshAll = async () => {
    setImageActionError(null)
    setImageActionMessage(null)
    await Promise.all([
      loadProduct(),
      loadProductImages(),
      loadProcessingStatus()
    ])
  }

  useEffect(() => {
    void loadProduct()
    void refreshImageManagementData()
    return () => stopPolling()
  }, [productId])

  useEffect(() => {
    if (isPolling) startPolling()
    else stopPolling()
  }, [isPolling])

  const startPolling = () => {
    if (pollIntervalRef.current) return
    pollIntervalRef.current = setInterval(() => {
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

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error) return err.message
    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string')
      return err.message
    return fallback
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProduct(productId)
      setProduct(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load product'))
    } finally {
      setLoading(false)
    }
  }

  const loadProductImagesSilent = async () => {
    try {
      const images = await imageManagementService.getProductImages(productId)
      setStoredImages(images)
      setStoredImageCount(images.length)
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
      setStoredImages(images)
      setStoredImageCount(images.length)
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
    if (isPolling && processingStatus?.stage !== 'approval_pending') {
      setImageActionMessage('Image discovery is already in progress — polling for updates…')
      return
    }
    await runImageAction('discover', async () => {
      try {
        const res = await imageManagementService.discoverImages(productId)
        const countMsg = res.discoveredCount != null
          ? `Found ${res.discoveredCount} candidate image(s).`
          : ''
        setImageActionMessage(
          [res.message || 'Image discovery completed', countMsg].filter(Boolean).join(' '),
        )
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status
        if (status === 409) {
          setImageActionMessage('Image discovery is already in progress — polling for updates…')
          return
        }
        throw err
      }
      await refreshImageManagementData()
    })
  }

  const handleRetryProcessing = () =>
    runImageAction('retry', async () => {
      const res = await imageManagementService.retryProcessing(productId)
      setProcessingStatus(res)
      setImageActionMessage('Retry started — polling for updates…')
      await refreshImageManagementData()
    })

  const handleApproveSelected = () =>
    runImageAction('approve', async () => {
      if (selectedImageIds.length === 0) return
      const res = await imageManagementService.approveImages(productId, {
        imageIds: selectedImageIds,
      })
      setImageActionMessage(res.message || 'Selected images approved')
      setSelectedImageIds([])
      await refreshImageManagementData()
      await loadProduct()
    })

  const handleDeleteImage = (imageId: string) => {
    if (!window.confirm('Delete this image from the product?')) return
    void runImageAction(`delete-${imageId}`, async () => {
      const res = await imageManagementService.deleteProductImage(productId, imageId)
      setImageActionMessage(res.message || 'Image deleted')
      setSelectedImageIds((cur) => cur.filter((id) => id !== imageId))
      await refreshImageManagementData()
      await loadProduct()
    })
  }

  const handleSetPrimary = (imageId: string) =>
    runImageAction(`primary-${imageId}`, async () => {
      const res = await imageManagementService.setPrimaryImage(productId, imageId)
      setImageActionMessage(res.message || 'Primary image updated')
      await Promise.all([refreshImageManagementData(), loadProduct()])
    })

  const toggleSelection = (image: DisplayImage) => {
    if (!image.selectable) return
    setSelectedImageIds((cur) =>
      cur.includes(image.id) ? cur.filter((id) => id !== image.id) : [...cur, image.id],
    )
  }

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
      : processingStatus?.status === 'in_progress'
        ? 'secondary'
        : processingStatus?.status === 'failed'
          ? 'destructive'
          : 'outline'

  const awaitingApproval = processingStatus?.stage === 'approval_pending'
  const discoveredCount = processingStatus?.discoveredImages?.length ?? 0

  const renderStepper = () => {
    if (!processingStatus) return null

    return (
      <div className="w-full bg-muted/30 rounded-xl p-5 border border-border/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="text-sm font-semibold">Discovery & Processing Pipeline</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPolling ? 'Pipeline is active - polling for updates...' : 'Pipeline idle'}
            </p>
          </div>
          {isPolling && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Active
            </div>
          )}
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2 pt-2">
          {/* Connector Line for horizontal layout (md and up) */}
          <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-border -z-10" />

          {STAGES.map((stageName) => {
            const state = getStepState(stageName)
            const label = STAGE_LABELS[stageName]
            
            // Icon selection
            let icon = <Clock className="h-4 w-4" />
            let iconClass = "bg-muted text-muted-foreground border-muted-foreground/30"
            let titleClass = "text-muted-foreground font-medium"

            if (state === 'completed') {
              icon = <CheckCircle2 className="h-4 w-4" />
              iconClass = "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500"
              titleClass = "text-foreground font-semibold"
            } else if (state === 'active') {
              icon = <Loader2 className="h-4 w-4 animate-spin" />
              iconClass = "bg-primary/10 text-primary border-primary ring-4 ring-primary/10"
              titleClass = "text-primary font-bold animate-pulse"
            } else if (state === 'failed') {
              icon = <AlertCircle className="h-4 w-4" />
              iconClass = "bg-destructive/10 text-destructive border-destructive"
              titleClass = "text-destructive font-bold"
            }

            return (
              <div key={stageName} className="flex md:flex-col items-center gap-3 md:gap-1.5 flex-1 w-full text-left md:text-center relative">
                {/* Visual Circle */}
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all ${iconClass} bg-background shrink-0 z-10`}>
                  {icon}
                </div>
                
                {/* Text Labels */}
                <div className="flex flex-col md:items-center min-w-0">
                  <span className={`text-xs md:text-xs truncate ${titleClass}`}>
                    {label.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 hidden md:block">
                    {label.description}
                  </span>
                  <span className="text-[10px] text-muted-foreground md:hidden">
                    {label.description}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-3xl w-full p-0 gap-0 overflow-hidden" showCloseButton={false}>
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

        <ScrollArea className="max-h-[calc(100vh-12rem)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="images">
                  Images
                  {allDisplayImages.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                      {allDisplayImages.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

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

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Description
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {product.description || 'No description provided.'}
                      </p>
                    </div>

                    <Separator />

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

              <TabsContent value="images" className="mt-4 space-y-4">
                {/* Pipeline / Actions Dashboard Card */}
                <Card className="border border-border/80 shadow-sm overflow-hidden bg-card">
                  <CardContent className="p-5 space-y-4">
                    {/* Header: Processing Status Badge & Inline Actions */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">Pipeline Status:</span>
                        <Badge variant={statusColor} className="capitalize">
                          {processingStatus?.status ?? 'No job'}
                        </Badge>
                        {processingStatus?.stage && (
                          <Badge variant="outline" className="capitalize">
                            {processingStatus.stage.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stepper display when polling or when a job status exists */}
                    {processingStatus && renderStepper()}

                    {/* Alert messages inside the controls card */}
                    {imageActionError && (
                      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{imageActionError}</span>
                      </div>
                    )}
                    
                    {/* Filter out polling message, as visual progress is shown by the stepper */}
                    {imageActionMessage && !imageActionMessage.includes('polling') && (
                      <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{imageActionMessage}</span>
                      </div>
                    )}

                    {/* Contextual Action Buttons */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {/* Show Discover Images button if not currently active processing/storing */}
                      {(!isPolling || awaitingApproval) && (
                        <Button
                          variant="default"
                          size="sm"
                          className="shadow-sm"
                          disabled={imageActionLoading !== null}
                          onClick={() => void handleDiscoverImages()}
                        >
                          {imageActionLoading === 'discover' ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Discovering…</>
                          ) : (
                            <><Search className="h-3.5 w-3.5 mr-1.5" />Discover Images</>
                          )}
                        </Button>
                      )}

                      {/* Prominent Retry Processing button if status is failed */}
                      {processingStatus?.status === 'failed' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={imageActionLoading !== null}
                          onClick={() => void handleRetryProcessing()}
                        >
                          {imageActionLoading === 'retry' ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Retrying…</>
                          ) : (
                            <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Retry Processing</>
                          )}
                        </Button>
                      )}

                      {/* Approve Selected button if candidates are selected */}
                      {selectedImageIds.length > 0 && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                          disabled={imageActionLoading !== null}
                          onClick={() => void handleApproveSelected()}
                        >
                          {imageActionLoading === 'approve' ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Approving…</>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              Approve {selectedImageIds.length} Selected
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions / Info banner */}
                {awaitingApproval && discoveredCount > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold flex items-center gap-1.5 text-xs">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Candidates Awaiting Selection
                    </p>
                    <p className="mt-1 text-xs opacity-90 leading-normal">
                      We found {discoveredCount} potential images. Select the ones that match your product by clicking on them in the gallery below, then click the <strong>Approve Selected</strong> button.
                    </p>
                  </div>
                )}

                {imagesLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-video rounded-lg" />
                    ))}
                  </div>
                ) : allDisplayImages.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No product images found</p>
                      <p className="text-xs text-muted-foreground text-center max-w-sm">
                        Run image discovery to search Google/Bing for product photos, then approve the best candidates.
                      </p>
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
                    {allDisplayImages.map((image) => {
                      const isSelected = selectedImageIds.includes(image.id)

                      return (
                        <div
                          key={`${image.kind}-${image.id}`}
                          onClick={() => toggleSelection(image)}
                          className={`group relative rounded-lg border-2 overflow-hidden transition-all ${image.selectable ? 'cursor-pointer' : 'cursor-default'} ${isSelected
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/40'
                            }`}
                        >
                          <div className="aspect-video bg-muted">
                            {image.thumbnailUrl || image.url ? (
                              <img
                                src={image.thumbnailUrl || image.url}
                                alt={image.id}
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

                          <div className="absolute top-1.5 left-1.5 flex gap-1 flex-wrap">
                            {image.isPrimary && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500 hover:bg-green-500">
                                Primary
                              </Badge>
                            )}
                            {image.kind === 'discovered' && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                Discovered
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4">Selected</Badge>
                            )}
                          </div>

                          <div className="px-2 py-1.5 bg-card border-t">
                            <p className="text-[10px] text-muted-foreground truncate">
                              {image.status} · {image.source ?? '—'}
                              {image.relevanceScore != null && ` · ${Math.round(image.relevanceScore * 100)}% match`}
                            </p>
                          </div>

                          {image.kind === 'stored' && (
                            <div
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!image.isPrimary && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-xs"
                                  disabled={imageActionLoading !== null}
                                  onClick={() => void handleSetPrimary(image.id)}
                                >
                                  {imageActionLoading === `primary-${image.id}` ? (
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
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                {imageActionLoading === `delete-${image.id}` ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {storedImageCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {storedImageCount} image(s) stored in Cloudinary for this product.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <Separator />
        <div className="flex items-center justify-between px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            disabled={loading || imagesLoading}
            onClick={() => void handleRefreshAll()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading || imagesLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
