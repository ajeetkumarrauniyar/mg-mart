import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Plus, Search, AlertCircle, Package } from 'lucide-react'
import { imageManagementService, productService } from '../services'
import type {
  Product,
  ProductListResponse,
  CreateProductData,
  ImageManagementHealth,
  ImageManagementStatistics,
} from '../services'
import { ProductModal } from './ProductModal'
import { ConfirmDialog } from './ConfirmDialog'
import { ProductDetail } from './ProductDetail'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'ok'>('all')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'normal'>('all')
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false })

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
        imageManagementService.getHealth(),
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })

  const getStockState = (stock: number) => {
    if (stock <= 0) return 'out'
    if (stock <= 10) return 'low'
    return 'ok'
  }

  const getStockBadgeVariant = (state: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (state === 'ok') return 'default'
    if (state === 'low') return 'secondary'
    return 'destructive'
  }

  const uniqueCategories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products],
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchTerm.trim() ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      const productStockState = getStockState(product.stock)
      const matchesStock = stockFilter === 'all' || stockFilter === productStockState
      const matchesFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && product.isFeatured) ||
        (featuredFilter === 'normal' && !product.isFeatured)
      return matchesSearch && matchesCategory && matchesStock && matchesFeatured
    })
  }, [products, searchTerm, categoryFilter, stockFilter, featuredFilter])

  const catalogStats = useMemo(
    () => ({
      total: filteredProducts.length,
      featured: filteredProducts.filter((p) => p.isFeatured).length,
      lowStock: filteredProducts.filter((p) => p.stock > 0 && p.stock <= 10).length,
      outOfStock: filteredProducts.filter((p) => p.stock <= 0).length,
    }),
    [filteredProducts],
  )

  const handleAddProduct = () => { setSelectedProduct(null); setModalMode('create'); setIsModalOpen(true) }
  const handleEditProduct = (product: Product) => { setSelectedProduct(product); setModalMode('edit'); setIsModalOpen(true) }
  const handleDeleteProduct = (product: Product) => setDeleteProduct(product)
  const handleViewProduct = (product: Product) => setDetailProductId(product.productId)

  const confirmDeleteProduct = async () => {
    if (!deleteProduct) return
    try {
      await productService.deleteProduct(deleteProduct.productId)
      await loadProducts()
      setDeleteProduct(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  const handleSaveProduct = async (productData: CreateProductData) => {
    if (modalMode === 'create') {
      await productService.createProduct(productData)
    } else if (selectedProduct) {
      await productService.updateProduct(selectedProduct.productId, productData)
    }
    await loadProducts()
  }

  const closeModal = () => { setIsModalOpen(false); setSelectedProduct(null) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage all SKUs in one simple table view.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void loadProducts()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={handleAddProduct}>
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visible SKUs', value: catalogStats.total, variant: 'normal' },
          { label: 'Featured', value: catalogStats.featured, variant: 'normal' },
          { label: 'Low Stock', value: catalogStats.lowStock, variant: 'warning' },
          { label: 'Out of Stock', value: catalogStats.outOfStock, variant: 'danger' },
        ].map((kpi) => (
          <Card key={kpi.label} className={kpi.variant === 'danger' ? 'border-destructive/30' : kpi.variant === 'warning' ? 'border-yellow-500/30' : ''}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${kpi.variant === 'danger' ? 'text-destructive' : kpi.variant === 'warning' ? 'text-yellow-600' : ''}`}>
                {kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU or description"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as 'all' | 'low' | 'out' | 'ok')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Levels</SelectItem>
            <SelectItem value="ok">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={(v) => setFeaturedFilter(v as 'all' | 'featured' | 'normal')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="featured">Featured Only</SelectItem>
            <SelectItem value="normal">Non-featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <p className="text-sm text-muted-foreground">{filteredProducts.length} products shown · Total: {pagination.total}</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No products match your filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockState = getStockState(product.stock)
                  return (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg border bg-muted shrink-0 overflow-hidden">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80x80?text=?' }} />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">SKU: {product.productId.slice(-8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                      <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-sm">{product.stock} {product.unit}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getStockBadgeVariant(stockState)}>
                            {stockState === 'ok' ? 'In Stock' : stockState === 'low' ? 'Low Stock' : 'Out of Stock'}
                          </Badge>
                          {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(product.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>View</Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Image Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Image System</CardTitle>
            <CardDescription>Automated image management health</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadImageManagementOverview()} disabled={imageOpsLoading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${imageOpsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={() => void handleCleanupTemporaryImages()} disabled={imageOpsLoading}>
              Clean Temp Files
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {imageOpsError && (
            <div className="flex gap-2 text-sm text-destructive mb-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{imageOpsError}</span>
            </div>
          )}
          {cleanupMessage && (
            <div className="text-sm text-green-600 mb-3">{cleanupMessage}</div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Health', value: imageHealth?.status ?? '—' },
              { label: 'Total Images', value: typeof imageStats?.totalImages === 'number' ? imageStats.totalImages : '—' },
              { label: 'Pending Approvals', value: typeof imageStats?.pendingApprovals === 'number' ? imageStats.pendingApprovals : '—' },
              { label: 'Failed Processing', value: typeof imageStats?.failedProcessing === 'number' ? imageStats.failedProcessing : '—' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold mt-1">{String(item.value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pagination.hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={() => void loadProducts()}>Load More Products</Button>
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
        onConfirm={() => void confirmDeleteProduct()}
        onCancel={() => setDeleteProduct(null)}
        confirmText="Delete"
        type="danger"
      />

      {detailProductId && (
        <ProductDetail productId={detailProductId} onClose={() => setDetailProductId(null)} />
      )}
    </div>
  )
}
