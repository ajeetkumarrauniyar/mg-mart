import { useState } from 'react'
import { authService } from '../services'
import type { LoginCredentials } from '../services'

interface LoginFormProps {
    onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await authService.login(credentials)
            console.log('Login successful:', response)

            // Check if user has admin role
            if (response.user.role !== 'admin' && response.user.role !== 'super_admin') {
                throw new Error('Access denied. Admin privileges required.')
            }

            onLoginSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
            console.error('Login error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="demo-credentials">
                    <p><strong>Demo Admin Credentials:</strong></p>
                    <p>Email: ajeetkumar5487@gmail.com</p>
                    <p>Password: 123456</p>
                    <div className="api-status">
                        <p><strong>API Endpoint:</strong></p>
                        <p>{import.meta.env.VITE_API_BASE_URL}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}