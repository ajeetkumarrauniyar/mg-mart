import { useEffect, useMemo, useState } from 'react'
import { productService } from '../services'
import type { Product, ProductListResponse } from '../services'

interface CategoryRow {
  name: string
  skuCount: number
  featuredCount: number
  lowStockCount: number
  outOfStockCount: number
  inventoryUnits: number
  lastUpdatedAt: string
}

export function CategoryList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'attention' | 'critical'>('all')

  useEffect(() => {
    void loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response: ProductListResponse = await productService.getProducts()
      setProducts(response.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const categories = useMemo<CategoryRow[]>(() => {
    const grouped = new Map<string, Product[]>()

    for (const product of products) {
      const key = product.category?.trim() || 'Uncategorized'
      const list = grouped.get(key) || []
      list.push(product)
      grouped.set(key, list)
    }

    return Array.from(grouped.entries()).map(([name, list]) => {
      const lowStockCount = list.filter((item) => item.stock > 0 && item.stock <= 10).length
      const outOfStockCount = list.filter((item) => item.stock <= 0).length
      const lastUpdatedAt = list
        .map((item) => item.updatedAt)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

      return {
        name,
        skuCount: list.length,
        featuredCount: list.filter((item) => item.isFeatured).length,
        lowStockCount,
        outOfStockCount,
        inventoryUnits: list.reduce((sum, item) => sum + Math.max(item.stock, 0), 0),
        lastUpdatedAt
      }
    }).sort((a, b) => b.skuCount - a.skuCount)
  }, [products])

  const getHealth = (row: CategoryRow): 'healthy' | 'attention' | 'critical' => {
    if (row.outOfStockCount > 0) return 'critical'
    if (row.lowStockCount > 0) return 'attention'
    return 'healthy'
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((row) => {
      const matchesSearch = !searchTerm.trim() || row.name.toLowerCase().includes(searchTerm.toLowerCase())
      const health = getHealth(row)
      const matchesHealth = healthFilter === 'all' || health === healthFilter
      return matchesSearch && matchesHealth
    })
  }, [categories, searchTerm, healthFilter])

  const stats = useMemo(() => {
    return {
      totalCategories: categories.length,
      totalSkus: categories.reduce((sum, row) => sum + row.skuCount, 0),
      attention: categories.filter((row) => getHealth(row) === 'attention').length,
      critical: categories.filter((row) => getHealth(row) === 'critical').length
    }
  }, [categories])

  if (loading) {
    return <div className="loading">Loading categories...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button className="retry-btn" onClick={() => void loadProducts()}>Retry</button>
      </div>
    )
  }

  return (
    <div className="categories-v2 section-stack">
      <div className="products-toolbar">
        <div>
          <h2>Categories</h2>
          <p>One clear view for category size, stock risk and featured mix.</p>
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-outline" onClick={() => void loadProducts()}>Refresh</button>
        </div>
      </div>

      <section className="catalog-kpi-row">
        <article className="catalog-kpi-card">
          <p className="kpi-label">Categories</p>
          <p className="kpi-value">{stats.totalCategories}</p>
        </article>
        <article className="catalog-kpi-card">
          <p className="kpi-label">Total SKUs</p>
          <p className="kpi-value">{stats.totalSkus}</p>
        </article>
        <article className="catalog-kpi-card warning">
          <p className="kpi-label">Need Attention</p>
          <p className="kpi-value">{stats.attention}</p>
        </article>
        <article className="catalog-kpi-card danger">
          <p className="kpi-label">Critical</p>
          <p className="kpi-value">{stats.critical}</p>
        </article>
      </section>

      <div className="products-filters-v2 categories-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search category name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value as 'all' | 'healthy' | 'attention' | 'critical')}
        >
          <option value="all">All Health States</option>
          <option value="healthy">Healthy</option>
          <option value="attention">Needs Attention</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="products-table-shell">
        <div className="products-table-header">
          <p>{filteredCategories.length} categories shown</p>
        </div>

        <div className="products-table-wrap">
          <table className="products-table-v2">
            <thead>
              <tr>
                <th>Category</th>
                <th>SKUs</th>
                <th>Featured</th>
                <th>Low Stock</th>
                <th>Out of Stock</th>
                <th>Inventory Units</th>
                <th>Health</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr><td colSpan={8} className="no-data">No categories match your filters.</td></tr>
              ) : filteredCategories.map((row) => {
                const health = getHealth(row)
                return (
                  <tr key={row.name}>
                    <td><strong>{row.name}</strong></td>
                    <td>{row.skuCount}</td>
                    <td>{row.featuredCount}</td>
                    <td>{row.lowStockCount}</td>
                    <td>{row.outOfStockCount}</td>
                    <td>{row.inventoryUnits}</td>
                    <td>
                      <span className={`stock-pill ${health === 'healthy' ? 'ok' : health === 'attention' ? 'low' : 'out'}`}>
                        {health === 'healthy' ? 'Healthy' : health === 'attention' ? 'Needs Attention' : 'Critical'}
                      </span>
                    </td>
                    <td>{formatDate(row.lastUpdatedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
