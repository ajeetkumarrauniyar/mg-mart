import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Product, CreateProductData } from '../services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: CreateProductData) => Promise<void>
  product?: Product | null
  mode: 'create' | 'edit'
}

export function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    stock: 0,
    unit: 'piece',
    isFeatured: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl || '',
        stock: product.stock,
        unit: product.unit,
        isFeatured: product.isFeatured,
      })
    } else {
      setFormData({ name: '', description: '', price: 0, category: '', imageUrl: '', stock: 0, unit: 'piece', isFeatured: false })
    }
    setError(null)
  }, [product, mode, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        </DialogHeader>

        <form id="product-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Product Name *</Label>
              <Input id="prod-name" name="name" value={formData.name} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-category">Category *</Label>
              <Input id="prod-category" name="category" value={formData.category} onChange={handleChange} required disabled={loading} placeholder="e.g., Fruits & Vegetables" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prod-description">Description *</Label>
            <Textarea id="prod-description" name="description" value={formData.description} onChange={handleChange} required disabled={loading} rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prod-price">Price (₹) *</Label>
              <Input id="prod-price" name="price" type="number" value={formData.price} onChange={handleChange} required disabled={loading} step="0.01" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-stock">Stock *</Label>
              <Input id="prod-stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required disabled={loading} min="0" />
            </div>
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, unit: v }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['piece', 'kg', 'g', 'lb', 'oz', 'l', 'ml'].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prod-imageUrl">Image URL</Label>
            <Input id="prod-imageUrl" name="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange} disabled={loading} placeholder="https://example.com/image.jpg" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-medium">Featured Product</span>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="product-form" disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
            ) : mode === 'create' ? 'Create Product' : 'Update Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}