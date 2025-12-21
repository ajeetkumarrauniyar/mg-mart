import type { OrderStatus } from '../services'
import { getStatusConfig, getStatusWorkflow } from '../utils/orderStatusUtils'
import './OrderStatusWorkflow.css'

interface OrderStatusWorkflowProps {
    currentStatus: OrderStatus
    size?: 'sm' | 'md' | 'lg'
}

/**
 * Visual representation of order status workflow
 * Shows the progression from pending to delivered
 */
export function OrderStatusWorkflow({ currentStatus, size = 'md' }: OrderStatusWorkflowProps) {
    const workflow = getStatusWorkflow()
    const currentIndex = workflow.findIndex(step => step.status === currentStatus)
    const isCancelled = currentStatus === 'cancelled'

    return (
        <div className={`status-workflow size-${size}`}>
            {isCancelled ? (
                <div className="workflow-cancelled">
                    <div className="cancelled-indicator">
                        <span className="cancelled-icon">❌</span>
                        <span className="cancelled-text">Order Cancelled</span>
                    </div>
                </div>
            ) : (
                <div className="workflow-steps">
                    {workflow.map((step, index) => {
                        const isCompleted = index < currentIndex
                        const isCurrent = index === currentIndex
                        const isPending = index > currentIndex
                        const config = getStatusConfig(step.status)

                        return (
                            <div key={step.status} className="workflow-step">
                                <div className={`step-indicator ${isCompleted ? 'completed' :
                                        isCurrent ? 'current' :
                                            'pending'
                                    }`}>
                                    <div
                                        className="step-circle"
                                        style={{
                                            backgroundColor: isCompleted || isCurrent ? config.color : '#e9ecef',
                                            borderColor: config.color
                                        }}
                                    >
                                        {isCompleted ? '✓' : config.icon}
                                    </div>
                                    <div className="step-label">
                                        <div className="step-title">{step.label}</div>
                                        <div className="step-description">{step.description}</div>
                                    </div>
                                </div>
                                {index < workflow.length - 1 && (
                                    <div className={`step-connector ${isCompleted ? 'completed' : 'pending'}`} />
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}