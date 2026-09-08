import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Users, AlertCircle, Loader2 } from 'lucide-react'
import { userService } from '../services'
import type { User, UpdateUserData } from '../services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: UpdateUserData) => Promise<void>
  user?: User | null
}

function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData & { email?: string }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ')
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: user.phoneNumber || '',
        role: user.role === 'super_admin' ? 'admin' : user.role,
      })
    }
    setError(null)
  }, [user, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        throw new Error('First name and last name are required')
      }
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form id="user-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={loading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email</Label>
            <Input id="userEmail" name="email" type="email" value={formData.email ?? ''} disabled className="bg-muted/50 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone ?? ''} onChange={handleChange} disabled={loading} placeholder="+91" />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role ?? 'customer'}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v as 'customer' | 'admin' }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="user-form" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all')

  useEffect(() => { void loadUsers() }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getUsers()
      const usersData = Array.isArray(response) ? response : response.users || []
      setUsers(usersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateValue: string | { _seconds: number; _nanoseconds: number }) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue._seconds * 1000)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const normalizedRole = user.role === 'super_admin' ? 'admin' : user.role
        const matchesRole = roleFilter === 'all' || normalizedRole === roleFilter
        const matchesSearch =
          !searchTerm.trim() ||
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        return matchesRole && matchesSearch
      }),
    [users, roleFilter, searchTerm],
  )

  const stats = useMemo(() => {
    const customers = filteredUsers.filter((u) => u.role === 'customer')
    const totalOrders = customers.reduce((sum, u) => sum + (u.orderCount || 0), 0)
    const highValue = customers.filter((u) => (u.totalSpent || 0) >= 10000).length
    return {
      total: filteredUsers.length,
      customers: customers.length,
      admins: filteredUsers.filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
      highValue,
      totalOrders,
    }
  }, [filteredUsers])

  const handleEditUser = (user: User) => { setSelectedUser(user); setIsModalOpen(true) }

  const handleSaveUser = async (userData: UpdateUserData) => {
    if (!selectedUser) return
    const updatedUser = await userService.updateUser(selectedUser.userId, userData)
    const mergedUser: User = { ...selectedUser, ...updatedUser, userId: selectedUser.userId }
    setUsers((prev) => prev.map((u) => (u.userId === selectedUser.userId ? mergedUser : u)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Simple customer list for quick support and account checks.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => void loadUsers()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visible Users', value: stats.total },
          { label: 'Customers', value: stats.customers },
          { label: 'Admins', value: stats.admins },
          { label: 'High Value (≥₹10k)', value: stats.highValue },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
          <Button variant="link" size="sm" className="ml-auto text-destructive h-auto p-0" onClick={() => void loadUsers()}>Retry</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email or phone"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as 'all' | 'customer' | 'admin')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="py-3 px-4">
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} users shown · Total orders: {stats.totalOrders}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No users match your filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const normalizedRole = user.role === 'super_admin' ? 'admin' : user.role
                  return (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">ID: {user.userId.slice(-8)}</p>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={normalizedRole === 'admin' ? 'default' : 'secondary'}>
                          {normalizedRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{user.orderCount ?? 0}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {user.totalSpent ? formatCurrency(user.totalSpent) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUser(null) }}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  )
}
