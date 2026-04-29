import type { OrderStatus } from '../services'
import { getStatusConfig, getStatusWorkflow } from '../utils/orderStatusUtils'

interface OrderStatusWorkflowProps {
  currentStatus: OrderStatus
  size?: 'sm' | 'md' | 'lg'
}

export function OrderStatusWorkflow({ currentStatus }: OrderStatusWorkflowProps) {
  const workflow = getStatusWorkflow()
  const currentIndex = workflow.findIndex((step) => step.status === currentStatus)
  const isCancelled = currentStatus === 'cancelled'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
        <span className="text-lg">❌</span>
        <span className="font-medium text-destructive">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0">
      {workflow.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const config = getStatusConfig(step.status)

        return (
          <div key={step.status} className="flex items-center flex-1 min-w-0">
            {/* Step */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              {/* Circle */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                }`}
                style={isCurrent ? { borderColor: config.color } : undefined}
              >
                {isCompleted ? '✓' : config.icon}
              </div>
              {/* Label */}
              <div className="text-center">
                <p className={`text-xs font-medium leading-tight ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
              </div>
            </div>

            {/* Connector line */}
            {index < workflow.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mb-5 rounded ${isCompleted ? 'bg-green-400' : 'bg-border'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
