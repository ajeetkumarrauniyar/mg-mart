import { useEffect, useState } from 'react'
import { userService } from '../services'
import type { User, UpdateUserData } from '../services'

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
        role: 'customer'
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
                role: user.role === 'super_admin' ? 'admin' : user.role
            })
        }
        setError(null)
    }, [user, isOpen])

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
                    <h2>Edit User</h2>
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
                            disabled={true}
                            placeholder="user@example.com"
                        />
                        <small className="form-note">Email cannot be changed</small>
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

                    <div className="edit-warning">
                        ℹ️ <strong>Note:</strong> User updates use the profile endpoint. Role updates may have limitations.
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
                            {loading ? 'Saving...' : 'Update User'}
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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all')
    const [apiStatus, setApiStatus] = useState<'success' | 'error' | 'fallback' | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            setApiStatus(null)

            // Load all users without filters - we'll filter client-side
            const response = await userService.getUsers()

            // Handle both array response and object response with users property
            const usersData = Array.isArray(response) ? response : response.users || []

            console.log('✅ Users loaded from API:', usersData.length, 'users')
            setUsers(usersData)
            setApiStatus('success')
        } catch (err) {
            console.error('❌ Users loading error:', err)
            setError(err instanceof Error ? err.message : 'Failed to load users')
            setApiStatus('error')
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

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setIsModalOpen(true)
    }

    const handleSaveUser = async (userData: UpdateUserData) => {
        if (!selectedUser) return

        try {
            console.log('🔄 Updating user:', selectedUser.userId, userData)

            const updatedUser = await userService.updateUser(selectedUser.userId, userData)

            // Update local state with API response
            const userToUpdate = {
                ...updatedUser,
                userId: selectedUser.userId // Preserve original userId
            }

            setUsers(prev => prev.map(u =>
                u.userId === selectedUser.userId ? userToUpdate : u
            ))

            console.log('✅ User updated successfully')
        } catch (err) {
            console.error('❌ User save error:', err)
            throw new Error(err instanceof Error ? err.message : 'Failed to save user')
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedUser(null)
    }

    // Client-side filtering for better UX (no loading states on search/filter changes)
    const filteredUsers = users.filter(user => {
        // Role filter
        if (roleFilter !== 'all' && user.role !== roleFilter) {
            return false
        }

        // Search filter (name, phone and email)
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase()
            const nameMatch = user.name.toLowerCase().includes(searchLower)
            const emailMatch = user.email.toLowerCase().includes(searchLower)
            const phoneMatch = user.phoneNumber?.toLowerCase().includes(searchLower) || false
            return nameMatch || emailMatch || phoneMatch
        }

        return true
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
                <div className="header-actions">
                    <button className="refresh-btn" onClick={loadUsers} disabled={loading}>
                        {loading ? '🔄' : '↻'} Refresh
                    </button>
                </div>
            </div>

            <div className="users-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users by name, email, or phone..."
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

            {apiStatus && (
                <div className={`api-status ${apiStatus}`}>
                    {apiStatus === 'success' && (
                        <>
                            ✅ <span>Data loaded from API successfully</span>
                        </>
                    )}
                    {apiStatus === 'error' && (
                        <>
                            ❌ <span>API connection failed</span>
                        </>
                    )}
                </div>
            )}

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
                                            title="Edit user"
                                        >
                                            Edit
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
            />
        </div>
    )
}