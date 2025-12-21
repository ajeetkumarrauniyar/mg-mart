import { useState, useEffect } from 'react'
import type { User, UpdateUserData } from '../services'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (userData: UpdateUserData) => Promise<void>
    user?: User | null
    mode: 'create' | 'edit'
}

export function UserModal({ isOpen, onClose, onSave, user, mode }: UserModalProps) {
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