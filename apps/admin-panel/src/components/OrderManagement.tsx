import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../services'
import type { Order, OrderStatus, OrderStats, OrderFilters } from '../services'
import {
    getValidNextStatuses,
    isValidStatusTransition,
    getStatusTransitionError,
    getStatusConfig
} from '../utils/orderStatusUtils'
import { OrderStatusWorkflow } from './OrderStatusWorkflow'
import './OrdersPage.css'

interface OrderManagementProps { }

/**
 * Comprehensive Order Management Component
 * Combines features from OrdersPage, OrdersPageSimple, and OrderTest
 * Works with your current API and gracefully handles optional features
 */
export function OrderManagement({ }: OrderManagementProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [stats, setStats] = useState<OrderStats | null>(null)
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
    const [bulkLoading, setBulkLoading] = useState(false)
    const [filters, setFilters] = useState<OrderFilters>({
        limit: 20,
        page: 1
    })
    const [showFilters, setShowFilters] = useState(false)
    const [exportLoading, setExportLoading] = useState(false)
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)

    useEffect(() => {
        loadOrders()
        loadStats()
    }, [filters])

    const loadOrders = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await orderService.getOrders({
                ...filters,
                search: searchTerm || undefined
            })

            setOrders(response.orders)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders')
            console.error('Orders loading error:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const statsData = await orderService.getOrderStats()
            setStats(statsData) // Will be null if endpoint not available
        } catch (err) {
            console.error('Stats loading error:', err)
            // Calculate stats from current orders if server stats not available
            if (orders.length > 0) {
                const calculatedStats = calculateStatsFromOrders()
                setStats(calculatedStats)
            }
        }
    }

    const calculateStatsFromOrders = (): OrderStats => {
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        const statusBreakdown = {
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
        }

        return {
            totalOrders,
            totalRevenue,
            averageOrderValue,
            statusBreakdown
        }
    }

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            setStatusUpdateError(null)

            // Find the current order to check status transition
            const currentOrder = orders.find(order => order.orderId === orderId)
            if (currentOrder && !isValidStatusTransition(currentOrder.status, newStatus)) {
                const errorMessage = getStatusTransitionError(currentOrder.status, newStatus)
                setStatusUpdateError(errorMessage)
                return
            }

            await orderService.updateOrderStatus(orderId, newStatus)
            await loadOrders() // Refresh the list
            await loadStats() // Refresh stats
        } catch (err) {
            console.error('Status update error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to update order status'
            setStatusUpdateError(errorMessage)
        }
    }

    const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
        if (selectedOrders.size === 0) return

        try {
            setBulkLoading(true)
            const orderIds = Array.from(selectedOrders)

            const result = await orderService.bulkUpdateStatus(orderIds, newStatus)

            if (result === null) {
                // Bulk update not available, update individually
                for (const orderId of orderIds) {
                    try {
                        await orderService.updateOrderStatus(orderId, newStatus)
                    } catch (err) {
                        console.error(`Failed to update order ${orderId}:`, err)
                    }
                }
            }

            setSelectedOrders(new Set())
            await loadOrders()
            await loadStats()
        } catch (err) {
            console.error('Bulk update error:', err)
            setStatusUpdateError('Failed to update selected orders')
        } finally {
            setBulkLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            setExportLoading(true)

            const blob = await orderService.exportOrders(filters)

            if (blob === null) {
                setStatusUpdateError('Export feature is not available')
                return
            }

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export error:', err)
            setStatusUpdateError('Failed to export orders')
        } finally {
            setExportLoading(false)
        }
    }

    const handleSearch = useCallback(() => {
        setFilters(prev => ({ ...prev, page: 1 }))
        loadOrders()
    }, [searchTerm])

    const handleSelectOrder = (orderId: string) => {
        const newSelected = new Set(selectedOrders)
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId)
        } else {
            newSelected.add(orderId)
        }
        setSelectedOrders(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedOrders.size === orders.length) {
            setSelectedOrders(new Set())
        } else {
            setSelectedOrders(new Set(orders.map(order => order.orderId)))
        }
    }

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'status-delivered'
            case 'processing': return 'status-processing'
            case 'pending': return 'status-pending'
            case 'shipped': return 'status-shipped'
            case 'cancelled': return 'status-cancelled'
            case 'confirmed': return 'status-processing'
            default: return 'status-pending'
        }
    }

    // Use server stats if available, otherwise calculate from current data
    const displayStats = stats || calculateStatsFromOrders()

    return (
        <div className="orders-page">
            <div className="page-header">
                <h2>Orders Management</h2>
                <p>Track and manage customer orders</p>
            </div>

            {/* Stats Cards */}
            {displayStats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{displayStats.totalOrders}</div>
                        <div className="stat-label">
                            Total Orders {!stats && '(Current View)'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{formatCurrency(displayStats.totalRevenue)}</div>
                        <div className="stat-label">
                            Total Revenue {!stats && '(Current View)'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{formatCurrency(displayStats.averageOrderValue)}</div>
                        <div className="stat-label">Average Order Value</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{displayStats.statusBreakdown.pending}</div>
                        <div className="stat-label">Pending Orders</div>
                    </div>
                </div>
            )}

            <div className="page-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="search-input"
                    />
                </div>
                <button className="btn btn-outline" onClick={handleSearch}>
                    <span>🔍</span>
                    Search
                </button>
                <button
                    className="btn btn-outline"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span>⚙️</span>
                    Filters
                </button>
                <button
                    className="btn btn-outline"
                    onClick={handleExport}
                    disabled={exportLoading}
                >
                    <span>📥</span>
                    {exportLoading ? 'Exporting...' : 'Export'}
                </button>
                <button className="btn btn-outline" onClick={loadOrders}>
                    <span>🔄</span>
                    Refresh
                </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-row">
                        <select
                            value={filters.status || ''}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                status: e.target.value as OrderStatus || undefined,
                                page: 1
                            }))}
                            className="filter-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <input
                            type="date"
                            value={filters.dateFrom || ''}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                dateFrom: e.target.value || undefined,
                                page: 1
                            }))}
                            className="filter-input"
                            placeholder="From Date"
                        />
                        <input
                            type="date"
                            value={filters.dateTo || ''}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                dateTo: e.target.value || undefined,
                                page: 1
                            }))}
                            className="filter-input"
                            placeholder="To Date"
                        />
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                setFilters({ limit: 20, page: 1 })
                                setSearchTerm('')
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            {selectedOrders.size > 0 && (
                <div className="bulk-actions">
                    <span className="bulk-count">
                        {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="bulk-buttons">
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleBulkStatusUpdate('processing')}
                            disabled={bulkLoading}
                        >
                            Mark Processing
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleBulkStatusUpdate('shipped')}
                            disabled={bulkLoading}
                        >
                            Mark Shipped
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleBulkStatusUpdate('delivered')}
                            disabled={bulkLoading}
                        >
                            Mark Delivered
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setSelectedOrders(new Set())}
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {statusUpdateError && (
                <div className="error">
                    <p>Status Update Error: {statusUpdateError}</p>
                    <button
                        onClick={() => setStatusUpdateError(null)}
                        className="btn btn-sm btn-outline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {loading && (
                <div className="loading">Loading orders...</div>
            )}

            {error && (
                <div className="error">
                    <p>Error: {error}</p>
                    <button onClick={loadOrders} className="btn btn-primary">
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.size === orders.length && orders.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="no-data">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status)
                                    const validNextStatuses = getValidNextStatuses(order.status)

                                    return (
                                        <tr key={order.orderId}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.has(order.orderId)}
                                                    onChange={() => handleSelectOrder(order.orderId)}
                                                />
                                            </td>
                                            <td className="order-id">#{order.orderId.slice(-6)}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <div className="customer-name">{order.customerName || 'N/A'}</div>
                                                    <div className="customer-email">{order.customerEmail || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td>{order.items?.length || 0} items</td>
                                            <td className="order-total">{formatCurrency(order.totalAmount)}</td>
                                            <td>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.orderId, e.target.value as OrderStatus)}
                                                    className={`status-select ${getStatusColor(order.status)}`}
                                                >
                                                    {/* Current status */}
                                                    <option value={order.status}>
                                                        {statusConfig.label}
                                                    </option>

                                                    {/* Valid next statuses */}
                                                    {validNextStatuses.map(status => (
                                                        <option key={status} value={status}>
                                                            {getStatusConfig(status).label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setShowModal(true)
                                                    }}
                                                    className="btn btn-sm btn-outline"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowModal(false)
                        setSelectedOrder(null)
                    }}
                />
            )}
        </div>
    )
}

// Enhanced Order Modal Component with Status Workflow
function OrderModal({ order, onClose }: {
    order: Order
    onClose: () => void
}) {
    const formatAddress = (address: any) => {
        if (typeof address === 'string') return address
        if (typeof address === 'object' && address) {
            return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}${address.country ? `, ${address.country}` : ''}`
        }
        return 'No address provided'
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Order Details - #{order.orderId.slice(-6)}</h3>
                    <button onClick={onClose} className="modal-close">×</button>
                </div>
                <div className="modal-body">
                    {/* Status Workflow */}
                    <div style={{ marginBottom: '20px' }}>
                        <OrderStatusWorkflow currentStatus={order.status} size="md" />
                    </div>

                    <div className="order-details">
                        <div className="detail-row">
                            <strong>Customer:</strong> {order.customerName || 'N/A'}
                        </div>
                        <div className="detail-row">
                            <strong>Email:</strong> {order.customerEmail || 'N/A'}
                        </div>
                        <div className="detail-row">
                            <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                        </div>
                        <div className="detail-row">
                            <strong>Status:</strong>
                            <span className={`status ${order.status}`}>{order.status}</span>
                        </div>
                        <div className="detail-row">
                            <strong>Payment:</strong> {order.paymentDetails.paymentMethod}
                        </div>
                        <div className="detail-row">
                            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                        </div>
                        {order.shippingAddress && (
                            <div className="detail-row">
                                <strong>Shipping Address:</strong>
                                <div className="address">{formatAddress(order.shippingAddress)}</div>
                            </div>
                        )}
                        {order.items && order.items.length > 0 && (
                            <div className="detail-row">
                                <strong>Items:</strong>
                                <div className="items-list">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="item">
                                            {item.name} - Qty: {item.quantity} - ${item.price.toFixed(2)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-outline">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}