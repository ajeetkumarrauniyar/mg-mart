import type { OrderStatus } from '../services'
import './OrderStatusBadge.css'

interface OrderStatusBadgeProps {
    status: OrderStatus
    size?: 'sm' | 'md' | 'lg'
    interactive?: boolean
    onClick?: () => void
}

export function OrderStatusBadge({
    status,
    size = 'md',
    interactive = false,
    onClick
}: OrderStatusBadgeProps) {
    const getStatusConfig = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Pending',
                    className: 'status-pending',
                    icon: '⏳'
                }
            case 'processing':
                return {
                    label: 'Processing',
                    className: 'status-processing',
                    icon: '⚙️'
                }
            case 'shipped':
                return {
                    label: 'Shipped',
                    className: 'status-shipped',
                    icon: '🚚'
                }
            case 'delivered':
                return {
                    label: 'Delivered',
                    className: 'status-delivered',
                    icon: '✅'
                }
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    className: 'status-cancelled',
                    icon: '❌'
                }
            default:
                return {
                    label: 'Unknown',
                    className: 'status-unknown',
                    icon: '❓'
                }
        }
    }

    const config = getStatusConfig(status)

    return (
        <span
            className={`status-badge ${config.className} size-${size} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? onClick : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
        >
            <span className="status-icon">{config.icon}</span>
            <span className="status-text">{config.label}</span>
        </span>
    )
}