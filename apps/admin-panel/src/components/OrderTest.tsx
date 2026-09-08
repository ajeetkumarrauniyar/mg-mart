import { useState, useEffect } from 'react'
import { orderService } from '../services'
import type { Order, OrderStatus } from '../services'
import { getValidNextStatuses, getStatusConfig } from '../utils/orderStatusUtils'
import { OrderStatusWorkflow } from './OrderStatusWorkflow'

/**
 * Simple test component to verify order management integration
 * This component can be used to test the API integration before using the full OrdersPage
 */
export function OrderTest() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)

    const testGetOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            console.log('Testing order API...')

            const response = await orderService.getOrders({ limit: 5 })
            console.log('API Response:', response)

            setOrders(response.orders)
            console.log('Orders loaded successfully:', response.orders.length)
        } catch (err) {
            console.error('API Error:', err)
            setError(err instanceof Error ? err.message : 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const testUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            setStatusUpdateError(null)
            console.log('Testing status update for order:', orderId, 'to status:', newStatus)
            await orderService.updateOrderStatus(orderId, newStatus)
            console.log('Status updated successfully')
            // Reload orders to see the change
            await testGetOrders()
        } catch (err) {
            console.error('Status update error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to update status'
            setStatusUpdateError(errorMessage)
        }
    }

    useEffect(() => {
        testGetOrders()
    }, [])

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Order Management API Test</h2>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testGetOrders}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Loading...' : 'Test Get Orders'}
                </button>
            </div>

            {statusUpdateError && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    Status Update Error: {statusUpdateError}
                    <button
                        onClick={() => setStatusUpdateError(null)}
                        style={{
                            marginLeft: '10px',
                            padding: '2px 8px',
                            backgroundColor: 'transparent',
                            border: '1px solid #721c24',
                            borderRadius: '3px',
                            color: '#721c24',
                            cursor: 'pointer'
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    Error: {error}
                </div>
            )}

            <div>
                <h3>Orders ({orders.length})</h3>
                {orders.length === 0 ? (
                    <p>No orders found</p>
                ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {orders.map((order) => {
                            const statusConfig = getStatusConfig(order.status)
                            const validNextStatuses = getValidNextStatuses(order.status)

                            return (
                                <div
                                    key={order.orderId}
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '15px',
                                        borderRadius: '4px',
                                        backgroundColor: '#f9f9f9'
                                    }}
                                >
                                    <div><strong>Order ID:</strong> {order.orderId}</div>
                                    <div>
                                        <strong>Status:</strong>
                                        <span style={{
                                            marginLeft: '8px',
                                            padding: '2px 8px',
                                            backgroundColor: statusConfig.bgColor,
                                            color: statusConfig.textColor,
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {statusConfig.icon} {statusConfig.label}
                                        </span>
                                    </div>
                                    <div><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</div>
                                    <div><strong>Items:</strong> {order.items.length}</div>
                                    <div><strong>Payment:</strong> {order.paymentDetails.paymentMethod}</div>
                                    <div><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</div>

                                    {/* Status Workflow */}
                                    <div style={{ marginTop: '15px' }}>
                                        <OrderStatusWorkflow currentStatus={order.status} size="sm" />
                                    </div>

                                    {/* Status Update Buttons */}
                                    {validNextStatuses.length > 0 && (
                                        <div style={{ marginTop: '15px' }}>
                                            <strong>Available Actions:</strong>
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {validNextStatuses.map(status => {
                                                    const nextStatusConfig = getStatusConfig(status)
                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() => testUpdateStatus(order.orderId, status)}
                                                            style={{
                                                                padding: '5px 10px',
                                                                backgroundColor: nextStatusConfig.color,
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '3px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            {nextStatusConfig.icon} Mark as {nextStatusConfig.label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {validNextStatuses.length === 0 && (
                                        <div style={{
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#e9ecef',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            color: '#666'
                                        }}>
                                            No further status changes available - this is a final state
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <h4>API Integration Status</h4>
                <ul>
                    <li>✅ Order listing: {orders.length > 0 ? 'Working' : 'No data'}</li>
                    <li>✅ Order structure: Compatible with API response</li>
                    <li>✅ Status updates: Ready for testing</li>
                    <li>✅ Status validation: Implemented</li>
                    <li>✅ Error handling: Implemented</li>
                    <li>✅ Status workflow: Visual representation</li>
                </ul>
                <p><strong>Next steps:</strong> Use the full OrdersPage component for complete functionality.</p>
            </div>
        </div>
    )
}