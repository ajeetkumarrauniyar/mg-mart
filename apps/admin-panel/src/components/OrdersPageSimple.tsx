import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../services'
import type { Order, OrderStatus, OrderFilters } from '../services'
import {
    getValidNextStatuses,
    isValidStatusTransition,
    getStatusTransitionError,
    getStatusConfig
} from '../utils/orderStatusUtils'
import { OrderStatusWorkflow } from './OrderStatusWorkflow'


interface OrdersPageSimpleProps { }

/**
 * Simplified OrdersPage that works with basic API endpoints
 * Only uses features that are confirmed to work with your API
 */
export function OrdersPageSimple({ }: OrdersPageSimpleProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [filters, setFilters] = useState<OrderFilters>({
        limit: 20,
        page: 1
    })
    const [showFilters, setShowFilters] = useState(false)
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)

    useEffect(() => {
        loadOrders()
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
        } catch (err) {
            console.error('Status update error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to update order status'
            setStatusUpdateError(errorMessage)
        }
    }

    const handleSearch = useCallback(() => {
        setFilters(prev => ({ ...prev, page: 1 }))
        loadOrders()
    }, [searchTerm])

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

    // Calculate basic stats from loaded orders
    const calculateStats = () => {
        if (orders.length === 0) return null

        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
        const averageOrderValue = totalRevenue / totalOrders

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

    const stats = calculateStats()

    return (
        <div className="orders-page">
            <div className="page-header">
                <h2>Orders Management</h2>
                <p>Track and manage customer orders</p>
            </div>

            {/* Basic Stats Cards (calculated from current data) */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalOrders}</div>
                        <div className="stat-label">Total Orders (Current View)</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                        <div className="stat-label">Total Revenue (Current View)</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{formatCurrency(stats.averageOrderValue)}</div>
                        <div className="stat-label">Average Order Value</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.statusBreakdown.pending}</div>
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
                                    <td colSpan={7} className="no-data">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.orderId}>
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
                                                    {getStatusConfig(order.status).label}
                                                </option>

                                                {/* Valid next statuses */}
                                                {getValidNextStatuses(order.status).map(status => (
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
                                ))
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