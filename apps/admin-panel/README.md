# MG Mart Admin Panel

A React TypeScript admin panel built with Vite for managing the MG Mart grocery application.

## Features

- Dashboard with key metrics and recent orders
- Product management (CRUD operations)
- Order management and status updates
- User management
- Settings configuration
- Axios-based API service with interceptors
- Environment-based configuration
- Token-based authentication

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Preview production build
pnpm preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# App Configuration
VITE_APP_NAME="MG Mart Admin Panel"
VITE_API_BASE_URL="https://mg-mart-server.onrender.com/api/v1"
VITE_TOKEN_KEY="admin_token_key"

# Debug Configuration
VITE_ENABLE_API_LOGGING="true"
VITE_ENABLE_DEBUG_MODE="true"
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Axios** - HTTP client with interceptors
- **ESLint** - Code linting
- **CSS** - Styling (no framework for now)

## Project Structure

```
src/
├── config/ # Configuration files
│ ├── api.ts # API endpoints configuration
│ ├── environment.ts # Environment variables
│ ├── debug.ts # Debug settings
│ ├── types.ts # Configuration types
│ └── index.ts # Main config export
├── services/ # API services
│ ├── apiService.ts # Base axios configuration
│ ├── authService.ts # Authentication service
│ ├── dashboardService.ts # Dashboard data service
│ ├── productService.ts # Product management
│ ├── orderService.ts # Order management
│ ├── userService.ts # User management
│ └── index.ts # Services export
├── App.tsx # Main application component
├── App.css # Application styles
├── main.tsx # Application entry point
└── index.css # Global styles
```

## API Services

The admin panel includes a comprehensive API service layer:

### Base API Service (`apiService.ts`)
- Axios instance with request/response interceptors
- Automatic token management with localStorage
- Error handling and transformation
- Request/response logging in development
- Generic CRUD methods (GET, POST, PUT, DELETE, PATCH)

### Specialized Services
- **authService** - Admin authentication and token management
- **dashboardService** - Dashboard statistics and analytics
- **productService** - Product CRUD operations with filtering
- **orderService** - Order management and status updates
- **userService** - User management operations

### Usage Example

```typescript
import { dashboardService, productService } from './services'

// Get dashboard stats
const stats = await dashboardService.getStats()

// Get products with filters
const products = await productService.getProducts({
category: 'electronics',
isActive: true,
page: 1,
limit: 10
})

// Create a new product
const newProduct = await productService.createProduct({
name: 'New Product',
price: 29.99,
category: 'electronics',
stock: 100
})
```

## Integration

This admin panel is part of the MG Mart monorepo and uses shared configurations:

- `@mg-mart/eslint-config` - Shared ESLint configuration
- `@mg-mart/typescript-config` - Shared TypeScript configuration

## Getting Started

1. The admin panel runs on `http://localhost:5174` by default when using `pnpm dev`
2. Configure environment variables in `.env`
3. The dashboard will attempt to load real data from the API
4. If API calls fail, error messages are displayed with fallback to demo data

## Authentication

The admin panel uses token-based authentication:
- Tokens are stored in localStorage
- Automatic token injection in API requests
- 401 responses trigger automatic logout and redirect
- Token management utilities available via `tokenManager`