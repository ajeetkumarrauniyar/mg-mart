import { useState } from 'react'
import { OrdersPage } from './OrdersPage'
import { OrderAnalytics } from './OrderAnalytics'
import './OrderDashboard.css'

interface OrderDashboardProps { }

export function OrderDashboard({ }: OrderDashboardProps) {
    const [activeTab, setActiveTab] = useState<'orders' | 'analytics'>('orders')

    return (
        <div className="order-dashboard">
            <div className="dashboard-header">
                <h1>Order Management</h1>
                <p>Comprehensive order tracking and analytics</p>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <span>📋</span>
                    Orders
                </button>
                <button
                    className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <span>📊</span>
                    Analytics
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'orders' && <OrdersPage />}
                {activeTab === 'analytics' && <OrderAnalytics />}
            </div>
        </div>
    )
}