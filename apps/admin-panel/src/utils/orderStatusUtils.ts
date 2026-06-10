import type { OrderStatus } from '../services'

/**
 * Order status transition rules based on business logic
 * These rules prevent invalid status changes (e.g., pending -> delivered)
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: [], // Final state - no transitions allowed
    cancelled: [] // Final state - no transitions allowed
}

/**
 * Get valid next statuses for a given current status
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    return ORDER_STATUS_TRANSITIONS[currentStatus] || []
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
): boolean {
    const validTransitions = ORDER_STATUS_TRANSITIONS[currentStatus]
    return validTransitions.includes(newStatus)
}

/**
 * Get status display configuration
 */
export function getStatusConfig(status: OrderStatus) {
    const configs = {
        pending: {
            label: 'Pending',
            color: '#ffc107',
            bgColor: '#fff3cd',
            textColor: '#856404',
            icon: '⏳',
            description: 'Order received, awaiting processing'
        },
        confirmed: {
            label: 'Confirmed',
            color: '#17a2b8',
            bgColor: '#d1ecf1',
            textColor: '#0c5460',
            icon: '✓',
            description: 'Order confirmed, ready for processing'
        },
        processing: {
            label: 'Processing',
            color: '#17a2b8',
            bgColor: '#d1ecf1',
            textColor: '#0c5460',
            icon: '⚙️',
            description: 'Order is being prepared'
        },
        shipped: {
            label: 'Shipped',
            color: '#007bff',
            bgColor: '#cce5ff',
            textColor: '#004085',
            icon: '📦',
            description: 'Order has been shipped'
        },
        out_for_delivery: {
            label: 'Out for Delivery',
            color: '#fd7e14',
            bgColor: '#ffe5d0',
            textColor: '#843504',
            icon: '🚚',
            description: 'Order is out for delivery'
        },
        delivered: {
            label: 'Delivered',
            color: '#28a745',
            bgColor: '#d4edda',
            textColor: '#155724',
            icon: '✅',
            description: 'Order successfully delivered'
        },
        cancelled: {
            label: 'Cancelled',
            color: '#dc3545',
            bgColor: '#f8d7da',
            textColor: '#721c24',
            icon: '❌',
            description: 'Order has been cancelled'
        }
    }

    return configs[status] || configs.pending
}

/**
 * Get status transition error message
 */
export function getStatusTransitionError(
    currentStatus: OrderStatus,
    attemptedStatus: OrderStatus
): string {
    const validStatuses = getValidNextStatuses(currentStatus)

    if (validStatuses.length === 0) {
        return `Cannot change status from ${currentStatus} - this is a final state`
    }

    return `Cannot change status from ${currentStatus} to ${attemptedStatus}. Valid transitions: ${validStatuses.join(', ')}`
}

/**
 * Get bulk operation compatible statuses
 * Returns statuses that can be applied to multiple orders safely
 */
export function getBulkCompatibleStatuses(): OrderStatus[] {
    return ['processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
}

/**
 * Check if status allows bulk operations
 */
export function canBulkUpdateToStatus(targetStatus: OrderStatus): boolean {
    return getBulkCompatibleStatuses().includes(targetStatus)
}

/**
 * Get status priority for sorting (lower number = higher priority)
 */
export function getStatusPriority(status: OrderStatus): number {
    const priorities = {
        pending: 1,
        confirmed: 2,
        processing: 3,
        shipped: 4,
        out_for_delivery: 5,
        delivered: 6,
        cancelled: 7
    }

    return priorities[status] || 999
}

/**
 * Sort orders by status priority
 */
export function sortOrdersByStatusPriority<T extends { status: OrderStatus }>(orders: T[]): T[] {
    return [...orders].sort((a, b) =>
        getStatusPriority(a.status) - getStatusPriority(b.status)
    )
}

/**
 * Get status workflow steps for display
 */
export function getStatusWorkflow(): Array<{
    status: OrderStatus
    label: string
    description: string
}> {
    return [
        {
            status: 'pending',
            label: 'Pending',
            description: 'Order received'
        },
        {
            status: 'processing',
            label: 'Processing',
            description: 'Being prepared'
        },
        {
            status: 'shipped',
            label: 'Shipped',
            description: 'On the way'
        },
        {
            status: 'out_for_delivery',
            label: 'Out for Delivery',
            description: 'With delivery partner'
        },
        {
            status: 'delivered',
            label: 'Delivered',
            description: 'Completed'
        }
    ]
}