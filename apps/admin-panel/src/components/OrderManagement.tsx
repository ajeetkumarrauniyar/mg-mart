import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  ShoppingCart,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import { orderService, userService } from '../services'
import type { Order, OrderStatus, OrderStats, OrderFilters } from '../services'
import {
  getValidNextStatuses,
  isValidStatusTransition,
  getStatusTransitionError,
  getStatusConfig,
} from '../utils/orderStatusUtils'
import { OrderStatusWorkflow } from './OrderStatusWorkflow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ── Status badge helper ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending: 'border-yellow-400/40 bg-yellow-50 text-yellow-700',
  processing: 'border-blue-400/40 bg-blue-50 text-blue-700',
  confirmed: 'border-indigo-400/40 bg-indigo-50 text-indigo-700',
  shipped: 'border-orange-400/40 bg-orange-50 text-orange-700',
  out_for_delivery: 'border-orange-400/40 bg-orange-50 text-orange-700',
  delivered: 'border-green-400/40 bg-green-50 text-green-700',
  cancelled: 'border-red-400/40 bg-red-50 text-red-700',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? ''
  return (
    <Badge variant="outline" className={`capitalize ${cls}`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

// ── Order detail modal ────────────────────────────────────────────────────────
function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const formatAddress = (address: unknown) => {
    if (typeof address === 'string') return address
    if (typeof address === 'object' && address !== null) {
      const a = address as Record<string, string>
      return `${a.street}, ${a.city}, ${a.state} ${a.zipCode}${a.country ? `, ${a.country}` : ''}`
    }
    return 'No address provided'
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details — #{order.orderId.slice(-6)}</DialogTitle>
        </DialogHeader>

        {/* Status workflow */}
        <div className="py-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Progress</p>
          <OrderStatusWorkflow currentStatus={order.status} />
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Customer', value: order.customerName || (order.customerEmail ? order.customerEmail.split('@')[0] : 'Customer') },
            { label: 'Email', value: order.customerEmail || '' },
            { label: 'Status', value: <StatusBadge status={order.status} /> },
            { label: 'Payment', value: order.paymentDetails?.paymentMethod || 'N/A' },
            { label: 'Total', value: `₹${order.totalAmount.toFixed(2)}` },
            { label: 'Date', value: new Date(order.createdAt).toLocaleString('en-IN') },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-0.5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <p className="text-xs text-muted-foreground mb-1">Shipping Address</p>
            <p className="font-medium">{formatAddress(order.shippingAddress)}</p>
          </div>
        )}

        {/* Items list */}
        {order.items && order.items.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items ({order.items.length})</p>
            <div className="rounded-lg border divide-y text-sm">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Qty: {item.quantity}</span>
                    <span className="font-medium text-foreground">₹{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface OrderManagementProps { }

export function OrderManagement({ }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [userNamesById, setUserNamesById] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)

  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [filters, setFilters] = useState<OrderFilters>({ limit: 20, page: 1 })
  const [showFilters, setShowFilters] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    void loadOrders()
  }, [filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await orderService.getOrders({ ...filters, search: searchTerm || undefined })
      setOrders(response.orders)
      await resolveCustomerNames(response.orders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }


  const resolveCustomerNames = async (orderList: Order[]) => {
    const uniqueUserIds = Array.from(
      new Set(orderList.map((order) => order.userId).filter((id): id is string => Boolean(id))),
    )
    const unresolvedIds = uniqueUserIds.filter((id) => !userNamesById[id])
    if (unresolvedIds.length === 0) return

    const lookups = await Promise.allSettled(
      unresolvedIds.map(async (userId) => ({
        userId,
        user: await userService.getUserById(userId),
      })),
    )

    const resolved: Record<string, string> = {}
    for (const item of lookups) {
      if (item.status === 'fulfilled' && item.value.user?.name?.trim()) {
        resolved[item.value.userId] = item.value.user.name
      }
    }

    if (Object.keys(resolved).length > 0) {
      setUserNamesById((prev) => ({ ...prev, ...resolved }))
    }
  }

  const getCustomerName = (order: Order): string => {
    if (order.customerName?.trim()) return order.customerName
    if (order.userId && userNamesById[order.userId]) return userNamesById[order.userId]
    if (order.customerEmail?.trim()) return order.customerEmail.split('@')[0]
    return 'Customer'
  }

  const calculateStatsFromOrders = (): OrderStats => ({
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length : 0,
    statusBreakdown: {
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    },
  })

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdateError(null)
    const currentOrder = orders.find((o) => o.orderId === orderId)
    if (currentOrder && !isValidStatusTransition(currentOrder.status, newStatus)) {
      setStatusUpdateError(getStatusTransitionError(currentOrder.status, newStatus))
      return
    }
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      await loadOrders()
    } catch (err) {
      setStatusUpdateError(err instanceof Error ? err.message : 'Failed to update order status')
    }
  }

  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    if (selectedOrders.size === 0) return
    try {
      setBulkLoading(true)
      const ids = Array.from(selectedOrders)
      const result = await orderService.bulkUpdateStatus(ids, newStatus)
      if (result === null) {
        for (const id of ids) {
          try { await orderService.updateOrderStatus(id, newStatus) } catch { /* skip */ }
        }
      }
      setSelectedOrders(new Set())
      await loadOrders()
    } catch {
      setStatusUpdateError('Failed to update selected orders')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExportLoading(true)
      const blob = await orderService.exportOrders(filters)
      if (!blob) { setStatusUpdateError('Export feature is not available'); return }
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      setStatusUpdateError('Failed to export orders')
    } finally {
      setExportLoading(false)
    }
  }

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: 1 }))
    void loadOrders()
  }, [searchTerm])

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.size === orders.length ? new Set() : new Set(orders.map((o) => o.orderId)),
    )
  }

  const filteredOrders = orders.filter(
    (o) =>
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(o).toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const displayStats = calculateStatsFromOrders()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Track and manage customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void loadOrders()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void handleExport()} disabled={exportLoading}>
            {exportLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: displayStats.totalOrders },
          { label: 'Total Revenue', value: formatCurrency(displayStats.totalRevenue) },
          { label: 'Avg Order Value', value: formatCurrency(displayStats.averageOrderValue) },
          { label: 'Pending', value: displayStats.statusBreakdown.pending },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label} (current view)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders…"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleSearch}>
          <Search className="h-3.5 w-3.5" />
          Search
        </Button>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={filters.status ?? ''}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, status: (v || undefined) as OrderStatus | undefined, page: 1 }))}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {['pending', 'processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                className="w-40"
                value={filters.dateFrom ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value || undefined, page: 1 }))}
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                className="w-40"
                value={filters.dateTo ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value || undefined, page: 1 }))}
              />

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => { setFilters({ limit: 20, page: 1 }); setSearchTerm('') }}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk action bar */}
      {selectedOrders.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">
            {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {(['processing', 'shipped', 'delivered'] as OrderStatus[]).map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                disabled={bulkLoading}
                onClick={() => void handleBulkStatusUpdate(s)}
              >
                {bulkLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Mark {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setSelectedOrders(new Set())}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Error banners */}
      {statusUpdateError && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{statusUpdateError}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-auto p-0 text-destructive" onClick={() => setStatusUpdateError(null)}>
            Dismiss
          </Button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-auto p-0 text-destructive" onClick={() => void loadOrders()}>
            Retry
          </Button>
        </div>
      )}

      {/* Orders table */}
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">{filteredOrders.length} orders shown</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No orders found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const validNext = getValidNextStatuses(order.status)

                  return (
                    <TableRow key={order.orderId} className={selectedOrders.has(order.orderId) ? 'bg-muted/40' : ''}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.orderId)}
                          onChange={() => toggleSelectOrder(order.orderId)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">#{order.orderId.slice(-6)}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{getCustomerName(order)}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail || ''}</p>
                      </TableCell>
                      <TableCell className="text-sm">{order.items?.length ?? 0} items</TableCell>
                      <TableCell className="font-medium text-sm">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        {/* Inline status select for quick updates */}
                        {validNext.length > 0 ? (
                          <select
                            value={order.status}
                            onChange={(e) => void handleStatusUpdate(order.orderId, e.target.value as OrderStatus)}
                            className="h-8 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            <option value={order.status}>{getStatusConfig(order.status).label}</option>
                            {validNext.map((s) => (
                              <option key={s} value={s}>{getStatusConfig(s).label}</option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={order.status} />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedOrder(order); setShowModal(true) }}
                          >
                            View
                          </Button>
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

      {showModal && selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => { setShowModal(false); setSelectedOrder(null) }} />
      )}
    </div>
  )
}
