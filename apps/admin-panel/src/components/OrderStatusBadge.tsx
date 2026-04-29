import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '../services'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onClick?: () => void
}

const STATUS_CONFIG: Record<OrderStatus | 'unknown', { label: string; icon: string; className: string }> = {
  pending: { label: 'Pending', icon: '⏳', className: 'border-yellow-400/40 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  processing: { label: 'Processing', icon: '⚙️', className: 'border-blue-400/40 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  confirmed: { label: 'Confirmed', icon: '✔️', className: 'border-indigo-400/40 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  out_for_delivery: { label: 'Out for Delivery', icon: '🚚', className: 'border-orange-400/40 bg-orange-50 text-orange-700 hover:bg-orange-100' },
  shipped: { label: 'Shipped', icon: '🚚', className: 'border-orange-400/40 bg-orange-50 text-orange-700 hover:bg-orange-100' },
  delivered: { label: 'Delivered', icon: '✅', className: 'border-green-400/40 bg-green-50 text-green-700 hover:bg-green-100' },
  cancelled: { label: 'Cancelled', icon: '❌', className: 'border-red-400/40 bg-red-50 text-red-700 hover:bg-red-100' },
  unknown: { label: 'Unknown', icon: '❓', className: '' },
}

export function OrderStatusBadge({ status, interactive = false, onClick }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown

  return (
    <Badge
      variant="outline"
      className={`gap-1 ${config.className} ${interactive ? 'cursor-pointer' : ''}`}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  )
}