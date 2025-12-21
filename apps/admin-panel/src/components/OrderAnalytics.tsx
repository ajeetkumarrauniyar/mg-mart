import { useState, useEffect } from 'react'
import { orderService } from '../services'
import type { OrderAnalytics, OrderStats } from '../services'

interface OrderAnalyticsProps {
    className?: string
}

export function OrderAnalytics({ className = '' }: OrderAnalyticsProps) {
    const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null)
    const [stats, setStats] = useState<OrderStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

    useEffect(() => {
        loadAnalytics()
    }, [period])

    const loadAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)

            const [analyticsData, statsData] = await Promise.all([
                orderService.getAnalytics(period),
                orderService.getOrderStats()
            ])

            setAnalytics(analyticsData)
            setStats(statsData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics')
            console.error('Analytics loading error:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatPercentage = (value: number, total: number) => {
        if (total === 0) return '0%'
        return `${((value / total) * 100).toFixed(1)}%`
    }

    if (loading) {
        return (
            <div className={`analytics-container ${className}`}>
                <div className="loading">Loading analytics...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`analytics-container ${className}`}>
                <div className="error">
                    <p>Error: {error}</p>
                    <button onClick={loadAnalytics} className="btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`analytics-container ${className}`}>
            <div className="analytics-header">
                <h3>Order Analytics</h3>
                <div className="period-selector">
                    <button
                        className={`period-btn ${period === '7d' ? 'active' : ''}`}
                        onClick={() => setPeriod('7d')}
                    >
                        7 Days
                    </button>
                    <button
                        className={`period-btn ${period === '30d' ? 'active' : ''}`}
                        onClick={() => setPeriod('30d')}
                    >
                        30 Days
                    </button>
                    <button
                        className={`period-btn ${period === '90d' ? 'active' : ''}`}
                        onClick={() => setPeriod('90d')}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            {analytics && (
                <div className="analytics-content">
                    {/* Key Metrics */}
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-value">{analytics.totalOrders}</div>
                            <div className="metric-label">Total Orders</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">{formatCurrency(analytics.totalRevenue)}</div>
                            <div className="metric-label">Total Revenue</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">{formatCurrency(analytics.averageOrderValue)}</div>
                            <div className="metric-label">Average Order Value</div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    {stats && (
                        <div className="status-breakdown">
                            <h4>Order Status Distribution</h4>
                            <div className="status-grid">
                                <div className="status-item">
                                    <div className="status-bar">
                                        <div
                                            className="status-fill status-pending"
                                            style={{ width: formatPercentage(stats.statusBreakdown.pending, stats.totalOrders) }}
                                        ></div>
                                    </div>
                                    <div className="status-info">
                                        <span className="status-label">Pending</span>
                                        <span className="status-count">
                                            {stats.statusBreakdown.pending}
                                            ({formatPercentage(stats.statusBreakdown.pending, stats.totalOrders)})
                                        </span>
                                    </div>
                                </div>

                                <div className="status-item">
                                    <div className="status-bar">
                                        <div
                                            className="status-fill status-processing"
                                            style={{ width: formatPercentage(stats.statusBreakdown.processing, stats.totalOrders) }}
                                        ></div>
                                    </div>
                                    <div className="status-info">
                                        <span className="status-label">Processing</span>
                                        <span className="status-count">
                                            {stats.statusBreakdown.processing}
                                            ({formatPercentage(stats.statusBreakdown.processing, stats.totalOrders)})
                                        </span>
                                    </div>
                                </div>

                                <div className="status-item">
                                    <div className="status-bar">
                                        <div
                                            className="status-fill status-shipped"
                                            style={{ width: formatPercentage(stats.statusBreakdown.shipped, stats.totalOrders) }}
                                        ></div>
                                    </div>
                                    <div className="status-info">
                                        <span className="status-label">Shipped</span>
                                        <span className="status-count">
                                            {stats.statusBreakdown.shipped}
                                            ({formatPercentage(stats.statusBreakdown.shipped, stats.totalOrders)})
                                        </span>
                                    </div>
                                </div>

                                <div className="status-item">
                                    <div className="status-bar">
                                        <div
                                            className="status-fill status-delivered"
                                            style={{ width: formatPercentage(stats.statusBreakdown.delivered, stats.totalOrders) }}
                                        ></div>
                                    </div>
                                    <div className="status-info">
                                        <span className="status-label">Delivered</span>
                                        <span className="status-count">
                                            {stats.statusBreakdown.delivered}
                                            ({formatPercentage(stats.statusBreakdown.delivered, stats.totalOrders)})
                                        </span>
                                    </div>
                                </div>

                                <div className="status-item">
                                    <div className="status-bar">
                                        <div
                                            className="status-fill status-cancelled"
                                            style={{ width: formatPercentage(stats.statusBreakdown.cancelled, stats.totalOrders) }}
                                        ></div>
                                    </div>
                                    <div className="status-info">
                                        <span className="status-label">Cancelled</span>
                                        <span className="status-count">
                                            {stats.statusBreakdown.cancelled}
                                            ({formatPercentage(stats.statusBreakdown.cancelled, stats.totalOrders)})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revenue Trend */}
                    {analytics.revenueByMonth && analytics.revenueByMonth.length > 0 && (
                        <div className="revenue-trend">
                            <h4>Revenue Trend</h4>
                            <div className="trend-chart">
                                {analytics.revenueByMonth.map((item, index) => (
                                    <div key={index} className="trend-item">
                                        <div className="trend-bar">
                                            <div
                                                className="trend-fill"
                                                style={{
                                                    height: `${(item.revenue / Math.max(...analytics.revenueByMonth.map(r => r.revenue))) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                        <div className="trend-label">{item.month}</div>
                                        <div className="trend-value">{formatCurrency(item.revenue)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}