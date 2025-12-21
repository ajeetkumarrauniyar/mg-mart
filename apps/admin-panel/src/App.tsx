import { useEffect, useState } from 'react'
import './App.css'
import { dashboardService, authService } from './services'
import type { DashboardStats } from './services'
import { LoginForm } from './components/LoginForm'
import { ProductList } from './components/ProductList'
import { UserList } from './components/UserList'
import { OrdersPage } from './components/OrdersPage'
import { SettingsPage } from './components/SettingsPage'
import './components/LoginForm.css'
import './components/ProductList.css'
import './components/ProductModal.css'
import './components/ConfirmDialog.css'
import './components/ProductDetail.css'
import './components/UserList.css'
import './components/OrdersPage.css'
import './components/SettingsPage.css'

type ActivePage = 'dashboard' | 'products' | 'orders' | 'users' | 'settings'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    setIsAuthenticated(authService.isAuthenticated())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const loadDashboardStats = async () => {
        try {
          setLoading(true)
          const data = await dashboardService.getStats()
          setStats(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard stats')
          console.error('Dashboard stats error:', err)
        } finally {
          setLoading(false)
        }
      }

      loadDashboardStats()
    }
  }, [isAuthenticated])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setStats(null)
      setError(null)
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>MG Mart Admin Panel</h1>
        <nav>
          <ul>
            <li>
              <button
                className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActivePage('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activePage === 'products' ? 'active' : ''}`}
                onClick={() => setActivePage('products')}
              >
                Products
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activePage === 'orders' ? 'active' : ''}`}
                onClick={() => setActivePage('orders')}
              >
                Orders
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activePage === 'users' ? 'active' : ''}`}
                onClick={() => setActivePage('users')}
              >
                Users
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activePage === 'settings' ? 'active' : ''}`}
                onClick={() => setActivePage('settings')}
              >
                Settings
              </button>
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <main className="admin-main">
        {activePage === 'dashboard' && (
          <section className="dashboard">
            <h2>Dashboard</h2>

            {loading && (
              <div className="loading">Loading dashboard stats...</div>
            )}

            {error && (
              <div className="error">
                <p>Error: {error}</p>
                <p>Using demo data for now.</p>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-number">
                  {stats?.totalProducts ?? 0}
                </p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">
                  {stats?.totalOrders ?? 0}
                </p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">
                  {stats?.totalUsers ?? 0}
                </p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-number">
                  {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '$0'}
                </p>
              </div>
            </div>

            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <section className="recent-orders">
                <h3>Recent Orders</h3>
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id.slice(-6)}</td>
                          <td>{order.customerName}</td>
                          <td>{formatCurrency(order.total)}</td>
                          <td>
                            <span className={`status status-${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </section>
        )}

        {activePage === 'products' && <ProductList />}

        {activePage === 'orders' && <OrdersPage />}

        {activePage === 'users' && <UserList />}

        {activePage === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}

export default App
