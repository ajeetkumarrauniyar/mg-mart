import { useEffect, useState } from 'react'
import { userService } from '../services'
import type { User, UserListResponse, UpdateUserData } from '../services'
import { ConfirmDialog } from './ConfirmDialog'

// Simple inline UserModal component
interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (userData: UpdateUserData) => Promise<void>
    user?: User | null
    mode: 'create' | 'edit'
}

function UserModal({ isOpen, onClose, onSave, user, mode }: UserModalProps) {
    const [formData, setFormData] = useState<UpdateUserData & { email?: string }>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'customer'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && mode === 'edit') {
            const nameParts = user.name.split(' ')
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email,
                phone: user.phoneNumber || '',
                role: user.role === 'super_admin' ? 'admin' : user.role
            })
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                role: 'customer'
            })
        }
        setError(null)
    }, [user, mode, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
                throw new Error('First name and last name are required')
            }

            if (mode === 'create' && !formData.email?.trim()) {
                throw new Error('Email is required')
            }

            await onSave(formData)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save user')
            console.error('User save error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{mode === 'create' ? 'Add New User' : 'Edit User'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required={mode === 'create'}
                            disabled={loading || mode === 'edit'}
                            placeholder="user@example.com"
                        />
                        {mode === 'edit' && (
                            <small className="form-note">Email cannot be changed</small>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="+1234567890"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role *</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={loading} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="save-btn">
                            {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function UserList() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteUser, setDeleteUser] = useState<User | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all')

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError(null)

            // Mock data with enhanced customer information
            const mockUsers: User[] = [
                {
                    userId: "HpjvtXJ6OwhHozmfrGyF",
                    email: "ajeetkumar5487@gmail.com",
                    name: "Ajeet Kumar",
                    phoneNumber: "+918084840429",
                    role: "admin",
                    createdAt: "2025-12-17T07:12:28.271Z",
                    updatedAt: "2025-12-17T07:12:28.271Z"
                },
                {
                    userId: "dvAdPECvLGHkkzJN7AXG",
                    email: "john@example.com",
                    name: "John Doe",
                    phoneNumber: "+1234567890",
                    role: "customer",
                    createdAt: "2025-10-07T19:35:53.560Z",
                    updatedAt: "2025-10-07T19:35:53.560Z",
                    orderCount: 24,
                    totalSpent: 1245.00,
                    lastOrderDate: "2025-12-21T10:30:00.000Z",
                    lastOrderId: "ORD-2025-001234"
                },
                {
                    userId: "abc123def456ghi789",
                    email: "jane.smith@example.com",
                    name: "Jane Smith",
                    phoneNumber: "+1987654321",
                    role: "customer",
                    createdAt: "2025-10-05T14:22:10.123Z",
                    updatedAt: "2025-10-05T14:22:10.123Z",
                    orderCount: 8,
                    totalSpent: 456.75,
                    lastOrderDate: "2025-12-20T15:45:00.000Z",
                    lastOrderId: "ORD-2025-001198"
                },
                {
                    userId: "xyz789uvw456rst123",
                    email: "admin@mgmart.com",
                    name: "Admin User",
                    phoneNumber: "+1555123456",
                    role: "admin",
                    createdAt: "2025-09-15T09:30:00.000Z",
                    updatedAt: "2025-09-15T09:30:00.000Z"
                },
                {
                    userId: "customer001active",
                    email: "sarah.wilson@email.com",
                    name: "Sarah Wilson",
                    phoneNumber: "+1555987654",
                    role: "customer",
                    createdAt: "2025-11-20T08:15:00.000Z",
                    updatedAt: "2025-12-15T12:30:00.000Z",
                    orderCount: 15,
                    totalSpent: 892.30,
                    lastOrderDate: "2025-12-19T09:20:00.000Z",
                    lastOrderId: "ORD-2025-001156"
                },
                {
                    userId: "customer002new",
                    email: "mike.johnson@gmail.com",
                    name: "Mike Johnson",
                    phoneNumber: "+1444555666",
                    role: "customer",
                    createdAt: "2025-12-10T16:45:00.000Z",
                    updatedAt: "2025-12-10T16:45:00.000Z",
                    orderCount: 3,
                    totalSpent: 127.50,
                    lastOrderDate: "2025-12-18T14:10:00.000Z",
                    lastOrderId: "ORD-2025-001089"
                }
            ]

            setUsers(mockUsers)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users')
            console.error('Users loading error:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string | { _seconds: number; _nanoseconds: number }) => {
        let date: Date

        if (typeof dateString === 'string') {
            date = new Date(dateString)
        } else {
            date = new Date(dateString._seconds * 1000)
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMs = now.getTime() - date.getTime()
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        if (diffInMinutes < 60) {
            return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
        } else if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
        } else if (diffInDays < 30) {
            return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
        } else {
            return formatDate(dateString)
        }
    }

    const handleAddUser = () => {
        setSelectedUser(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleDeleteUser = (user: User) => {
        setDeleteUser(user)
    }

    const confirmDeleteUser = async () => {
        if (!deleteUser) return

        try {
            setUsers(prev => prev.filter(u => u.userId !== deleteUser.userId))
            setDeleteUser(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user')
            console.error('User deletion error:', err)
        }
    }

    const handleSaveUser = async (userData: UpdateUserData) => {
        try {
            if (modalMode === 'create') {
                const newUser: User = {
                    userId: `user_${Date.now()}`,
                    email: `${userData.firstName?.toLowerCase()}.${userData.lastName?.toLowerCase()}@example.com`,
                    name: `${userData.firstName} ${userData.lastName}`,
                    phoneNumber: userData.phone,
                    role: userData.role || 'customer',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setUsers(prev => [...prev, newUser])
            } else if (selectedUser) {
                setUsers(prev => prev.map(u =>
                    u.userId === selectedUser.userId
                        ? {
                            ...u,
                            name: `${userData.firstName} ${userData.lastName}`,
                            phoneNumber: userData.phone,
                            role: userData.role || u.role,
                            updatedAt: new Date().toISOString()
                        }
                        : u
                ))
            }
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to save user')
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedUser(null)
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    if (loading) {
        return (
            <div className="users-container">
                <div className="loading">Loading users...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="users-container">
                <div className="error">
                    <p>Error: {error}</p>
                    <button onClick={loadUsers} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="users-container">
            <div className="users-header">
                <h2>Users ({filteredUsers.length})</h2>
                <button className="add-user-btn" onClick={handleAddUser}>
                    Add User
                </button>
            </div>

            <div className="users-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="role-filter">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as 'all' | 'customer' | 'admin')}
                        className="filter-select"
                    >
                        <option value="all">All Roles</option>
                        <option value="customer">Customers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <p>No users found</p>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Last Order</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.userId}>
                                    <td className="user-name">
                                        <div className="user-info">
                                            <span className="name">{user.name}</span>
                                            <span className="user-id">ID: {user.userId.slice(-8)}</span>
                                        </div>
                                    </td>
                                    <td className="user-email">{user.email}</td>
                                    <td className="user-phone">{user.phoneNumber || 'N/A'}</td>
                                    <td className="user-role">
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="user-orders">
                                        {user.role === 'customer' && user.orderCount !== undefined ? (
                                            <div className="order-info">
                                                <span className="order-count">{user.orderCount}</span>
                                                <span className="order-label">Orders</span>
                                            </div>
                                        ) : (
                                            <span className="not-applicable">N/A</span>
                                        )}
                                    </td>
                                    <td className="user-spent">
                                        {user.role === 'customer' && user.totalSpent !== undefined ? (
                                            <div className="spent-info">
                                                <span className="spent-amount">{formatCurrency(user.totalSpent)}</span>
                                                <span className="spent-label">Spent</span>
                                            </div>
                                        ) : (
                                            <span className="not-applicable">N/A</span>
                                        )}
                                    </td>
                                    <td className="user-last-order">
                                        {user.role === 'customer' && user.lastOrderDate ? (
                                            <div className="last-order-info">
                                                <span className="last-order-time">{getTimeAgo(user.lastOrderDate)}</span>
                                                <span className="last-order-id">#{user.lastOrderId?.slice(-6)}</span>
                                            </div>
                                        ) : (
                                            <span className="not-applicable">N/A</span>
                                        )}
                                    </td>
                                    <td className="user-created">{formatDate(user.createdAt)}</td>
                                    <td className="user-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteUser(user)}
                                            disabled={user.role === 'admin' && user.email === 'ajeetkumar5487@gmail.com'}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveUser}
                user={selectedUser}
                mode={modalMode}
            />

            <ConfirmDialog
                isOpen={!!deleteUser}
                title="Delete User"
                message={`Are you sure you want to delete "${deleteUser?.name}"? This action cannot be undone.`}
                onConfirm={confirmDeleteUser}
                onCancel={() => setDeleteUser(null)}
                confirmText="Delete"
                type="danger"
            />
        </div>
    )
}