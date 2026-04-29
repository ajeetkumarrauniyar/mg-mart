import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { dashboardService, authService } from './services'
import type { DashboardStats } from './services'
import { LoginForm } from './components/LoginForm'
import { ProductList } from './components/ProductList'
import { UserList } from './components/UserList'
import { OrderManagement } from './components/OrderManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Toaster } from '@/components/ui/sonner'

type ActivePage =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'customers'
  | 'delivery'
  | 'payments'
  | 'reports'
  | 'settings'

interface NavItem {
  key: ActivePage
  label: string
  subtitle: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', subtitle: 'Store pulse', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', subtitle: 'Fulfillment', icon: ShoppingCart },
  { key: 'products', label: 'Products', subtitle: 'Catalog', icon: Package },
  { key: 'categories', label: 'Categories', subtitle: 'Taxonomy', icon: Tag },
  { key: 'customers', label: 'Customers', subtitle: 'Lifecycle', icon: Users },
  { key: 'delivery', label: 'Delivery / Areas', subtitle: 'Coverage map', icon: Truck },
  { key: 'payments', label: 'Payments', subtitle: 'Settlements', icon: CreditCard },
  { key: 'reports', label: 'Reports', subtitle: 'Business intelligence', icon: BarChart3 },
  { key: 'settings', label: 'Settings', subtitle: 'Store controls', icon: Settings },
]

function InsightGrid({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; value: string; note: string }>
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function WorkflowBoard({
  title,
  rows,
}: {
  title: string
  rows: Array<{ name: string; owner: string; eta: string; state: string }>
}) {
  const stateVariant = (state: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (state.toLowerCase()) {
      case 'delivered':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'pending':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Queue</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">{row.owner}</TableCell>
                <TableCell className="text-muted-foreground">{row.eta}</TableCell>
                <TableCell>
                  <Badge variant={stateVariant(row.state)}>{row.state}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const loadDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard stats')
        console.error('Dashboard stats error:', err)
      } finally {
        setLoading(false)
      }
    }

    void loadDashboardStats()
  }, [isAuthenticated])

  const handleLoginSuccess = () => setIsAuthenticated(true)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (logoutError) {
      console.error('Logout error:', logoutError)
    } finally {
      setIsAuthenticated(false)
      setStats(null)
      setError(null)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)

  const dashboardCards = useMemo(
    () => [
      {
        label: 'Total Products',
        value: stats?.totalProducts ?? 0,
        icon: Package,
        delta: '+12 this week',
      },
      {
        label: 'Total Orders',
        value: stats?.totalOrders ?? 0,
        icon: ShoppingCart,
        delta: '+8% vs last month',
      },
      {
        label: 'Total Users',
        value: stats?.totalUsers ?? 0,
        icon: Users,
        delta: '+34 new today',
      },
      {
        label: 'Gross Revenue',
        value: stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(0),
        icon: TrendingUp,
        delta: 'All time',
      },
    ],
    [stats],
  )

  const sectionSnapshots = {
    categories: [
      { label: 'Active Categories', value: '18', note: 'Across Grocery, Dairy, Snacks, Produce' },
      { label: 'Hidden Categories', value: '4', note: 'Seasonal/off-cycle groups' },
      { label: 'Top Category GMV', value: formatCurrency(932000), note: 'Fresh Produce - current month' },
      { label: 'Unmapped SKUs', value: '27', note: 'Need category placement' },
    ],
    delivery: [
      { label: 'Active Zones', value: '23', note: '12 city core, 11 suburban' },
      { label: 'Avg Delivery Time', value: '26 mins', note: 'Rolling 7-day average' },
      { label: 'On-time Rate', value: '92.8%', note: 'Target 95%' },
      { label: 'High Risk Areas', value: '3', note: 'Traffic + staffing issue' },
    ],
    payments: [
      { label: 'Today Collected', value: formatCurrency(186500), note: 'UPI, cards and COD settlements' },
      { label: 'Pending Settlements', value: formatCurrency(74800), note: 'Bank transfer batch at 8 PM' },
      { label: 'Failed Transactions', value: '19', note: 'Need retry communication' },
      { label: 'Refund Queue', value: formatCurrency(13240), note: '33 refund tickets open' },
    ],
    reports: [
      { label: 'Daily Ops Report', value: 'Generated', note: 'Updated 08:30 IST' },
      { label: 'Inventory Variance', value: '2.9%', note: 'Within control threshold' },
      { label: 'Customer Churn Risk', value: '6.2%', note: 'Repeat buyers at risk' },
      { label: 'Promo ROI', value: '1.84x', note: 'This week campaign efficiency' },
    ],
  }

  const getOrderStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'delivered': return 'default'
      case 'processing': return 'secondary'
      case 'pending': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        <Toaster />
      </>
    )
  }

  const activeNavItem = NAV_ITEMS.find((item) => item.key === activePage)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-card flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            MG Mart
          </p>
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Admin Console
          </h1>
        </div>

        <Separator />

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-accent hover:text-accent-foreground text-foreground/70'
                    }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'}`}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary-foreground' : ''}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs truncate ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Logout */}
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Operations
            </p>
            <h2 className="text-xl font-bold mt-0.5">
              {activeNavItem?.label ?? 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-20" />
                      </CardContent>
                    </Card>
                  ))
                  : dashboardCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <Card key={card.label} className="relative overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                          <CardDescription>{card.label}</CardDescription>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{card.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{card.delta}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Failed to load live stats</p>
                    <p className="text-destructive/80">{error} — showing fallback values.</p>
                  </div>
                </div>
              )}

              {/* Recent orders table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Orders</CardTitle>
                    <CardDescription>{stats?.recentOrders?.length ?? 0} records</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : stats?.recentOrders?.length ? (
                        stats.recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">#{order.id.slice(-6)}</TableCell>
                            <TableCell className="font-medium">{order.customerName}</TableCell>
                            <TableCell>{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                              <Badge variant={getOrderStatusVariant(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                            No recent orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activePage === 'orders' && <OrderManagement />}
          {activePage === 'products' && <ProductList />}
          {activePage === 'customers' && <UserList />}

          {activePage === 'categories' && (
            <div className="space-y-6">
              <InsightGrid title="Category Performance" items={sectionSnapshots.categories} />
              <WorkflowBoard
                title="Category Maintenance Queue"
                rows={[
                  { name: 'Bakery SKU normalization', owner: 'Merch Team', eta: 'Today, 3:30 PM', state: 'Processing' },
                  { name: 'Import drinks taxonomy', owner: 'Catalog Ops', eta: 'Tomorrow, 11:00 AM', state: 'Pending' },
                  { name: 'Festival bundle group', owner: 'Growth', eta: 'Fri, 5:00 PM', state: 'Delivered' },
                ]}
              />
            </div>
          )}

          {activePage === 'delivery' && (
            <div className="space-y-6">
              <InsightGrid title="Delivery Area Health" items={sectionSnapshots.delivery} />
              <WorkflowBoard
                title="Rider Allocation Board"
                rows={[
                  { name: 'Zone A1 - Premium Apartments', owner: 'Dispatch East', eta: 'Under 20 mins', state: 'Delivered' },
                  { name: 'Zone C3 - Market Stretch', owner: 'Dispatch Central', eta: '28 mins', state: 'Processing' },
                  { name: 'Zone D2 - Outer Ring', owner: 'Dispatch West', eta: '34 mins', state: 'Pending' },
                ]}
              />
            </div>
          )}

          {activePage === 'payments' && (
            <div className="space-y-6">
              <InsightGrid title="Payments Control Desk" items={sectionSnapshots.payments} />
              <WorkflowBoard
                title="Settlement Pipeline"
                rows={[
                  { name: 'UPI Batch - Morning', owner: 'Gateway A', eta: 'Completed 10:30 AM', state: 'Delivered' },
                  { name: 'COD Reconciliation', owner: 'Finance Ops', eta: 'Today 9:00 PM', state: 'Processing' },
                  { name: 'Card chargeback review', owner: 'Risk Team', eta: 'Tomorrow 4:00 PM', state: 'Pending' },
                ]}
              />
            </div>
          )}

          {activePage === 'reports' && (
            <div className="space-y-6">
              <InsightGrid title="Reporting Console" items={sectionSnapshots.reports} />
              <div>
                <h3 className="text-lg font-semibold mb-4">Report Builder</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Operational Pack', desc: 'Orders, SLAs, stockouts, rider load, payment delays.', action: 'Run Now' },
                    { title: 'Executive Summary', desc: 'GMV, margin trend, repeat customer rate, and churn risk.', action: 'Schedule Daily' },
                    { title: 'Category Snapshot', desc: 'Category mix, top movers, dead inventory and markdown risk.', action: 'Export CSV' },
                  ].map((report) => (
                    <Card key={report.title}>
                      <CardHeader>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription>{report.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button size="sm" variant="outline">{report.action}</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Store Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Order Automation', desc: 'Auto-confirm prepaid orders within 2 minutes.', action: 'Enabled' },
                    { title: 'Delivery Radius', desc: 'Primary radius 9 km. Surge lock beyond 7 km.', action: 'Edit Radius' },
                    { title: 'Payment Guardrails', desc: 'Auto-flag high value COD orders above ₹4000.', action: 'Manage Rules' },
                    { title: 'Catalog Publishing', desc: 'Publish window: 7:00 AM to 11:00 PM daily.', action: 'Adjust Window' },
                  ].map((setting) => (
                    <Card key={setting.title}>
                      <CardHeader>
                        <CardTitle className="text-base">{setting.title}</CardTitle>
                        <CardDescription>{setting.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button size="sm" variant="outline">{setting.action}</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Toaster />
    </div>
  )
}

export default App
