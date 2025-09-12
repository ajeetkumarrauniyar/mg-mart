# MG Mart Repositories Documentation

## Overview

The `repositories` folder contains the data access layer for the MG Mart grocery application. Each repository implements the Repository Pattern to provide a clean abstraction layer between the business logic and Firebase Firestore database operations.

## Architecture

### Repository Pattern Benefits

- **Separation of Concerns**: Clean separation between data access and business logic
- **Testability**: Easy to mock for unit testing
- **Maintainability**: Centralized database operations
- **Consistency**: Standardized data access patterns
- **Type Safety**: Full TypeScript support with proper interfaces

### Database Technology

- **Firebase Firestore**: NoSQL document database
- **Collections**: Users, Products, Orders, Cart (subcollection)
- **Authentication**: Firebase Admin SDK
- **Real-time**: Support for real-time updates

## Repository Classes

### 1. UserRepository

**Purpose**: Manages user accounts and authentication data

**Key Features**:

- User account creation and management
- Email-based user lookup for authentication
- Profile updates and user management
- Role-based access control support

**Methods**:

```typescript
create(userData: CreateUserInput): Promise<UserResponse>
findById(userId: string): Promise<UserResponse | null>
findByEmail(email: string): Promise<User | null>
update(userId: string, updateData: UpdateUserInput): Promise<UserResponse | null>
delete(userId: string): Promise<boolean>
list(limit?: number, offset?: number): Promise<UserResponse[]>
```

**Use Cases**:

- User registration and login
- Profile management
- Admin user management
- Authentication workflows

---

### 2. ProductRepository

**Purpose**: Manages the product catalog and inventory

**Key Features**:

- Complete product CRUD operations
- Inventory management and stock tracking
- Product search and filtering
- Featured products management
- Category-based organization

**Methods**:

```typescript
create(productData: CreateProductInput): Promise<ProductResponse>
findById(productId: string): Promise<ProductResponse | null>
update(productId: string, updateData: UpdateProductInput): Promise<ProductResponse | null>
delete(productId: string): Promise<boolean>
list(options?: FilterOptions): Promise<ProductResponse[]>
getFeaturedProducts(limit?: number): Promise<ProductResponse[]>
searchProducts(searchTerm: string, limit?: number): Promise<ProductResponse[]>
updateStock(productId: string, newStock: number): Promise<boolean>
```

**Use Cases**:

- Product catalog management
- Inventory tracking
- Product search and discovery
- Featured product displays
- Stock management

---

### 3. CartRepository

**Purpose**: Manages user shopping carts

**Key Features**:

- User-specific cart management using Firestore subcollections
- Automatic product validation and stock checking
- Real-time cart totals calculation
- Automatic cleanup of unavailable products

**Methods**:

```typescript
addItem(userId: string, itemData: AddToCartInput): Promise<boolean>
updateItem(userId: string, productId: string, updateData: UpdateCartItemInput): Promise<boolean>
removeItem(userId: string, productId: string): Promise<boolean>
getCart(userId: string): Promise<CartResponse>
clearCart(userId: string): Promise<boolean>
getItemCount(userId: string): Promise<number>
```

**Use Cases**:

- Shopping cart functionality
- E-commerce checkout process
- Cart persistence across sessions
- Real-time cart updates

---

### 4. OrderRepository

**Purpose**: Manages order processing and tracking

**Key Features**:

- Complete order lifecycle management
- Order status tracking and updates
- User order history
- Order analytics and reporting
- Comprehensive order statistics

**Methods**:

```typescript
create(orderData: CreateOrderInput): Promise<OrderResponse>
findById(orderId: string): Promise<OrderResponse | null>
findByUserId(userId: string, limit?: number, offset?: number): Promise<OrderResponse[]>
update(orderId: string, updateData: UpdateOrderInput): Promise<OrderResponse | null>
updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponse | null>
list(options?: FilterOptions): Promise<OrderResponse[]>
getOrdersByStatus(status: OrderStatus, limit?: number): Promise<OrderResponse[]>
getOrderStats(userId?: string): Promise<OrderStatistics>
```

**Use Cases**:

- Order processing workflows
- Order tracking and status updates
- Customer order history
- Business analytics and reporting
- Order fulfillment management

## Data Flow

```
Client Request → API Endpoint → Repository → Firebase Firestore → Response
```

### Example Usage

```typescript
import {
  UserRepository,
  ProductRepository,
  CartRepository,
  OrderRepository,
} from "./repositories";

// Initialize repositories
const userRepo = new UserRepository();
const productRepo = new ProductRepository();
const cartRepo = new CartRepository();
const orderRepo = new OrderRepository();

// Example: Complete e-commerce flow
const user = await userRepo.create(userData);
const product = await productRepo.create(productData);
await cartRepo.addItem(user.userId, {
  productId: product.productId,
  quantity: 2,
});
const cart = await cartRepo.getCart(user.userId);
const order = await orderRepo.create(orderData);
```

## Error Handling

All repositories implement consistent error handling:

- **Validation Errors**: Input validation with descriptive messages
- **Not Found**: Returns `null` for missing resources
- **Database Errors**: Proper Firebase error propagation
- **Type Safety**: Full TypeScript error checking

## Testing

All repositories are thoroughly tested with:

- **Unit Tests**: Individual method testing
- **Integration Tests**: Firebase integration testing
- **Mock Support**: Easy mocking for unit tests
- **Test Coverage**: Comprehensive test coverage

### Running Tests

```bash
# Run repository tests
npm run test-repos

# Run individual repository tests
npm run test -- UserRepository
```

## Performance Considerations

### Firestore Optimization

- **Composite Indexes**: Required for complex queries
- **Pagination**: Built-in pagination support
- **Batch Operations**: Efficient bulk operations
- **Caching**: Firestore automatic caching

### Required Firestore Indexes

The following composite indexes are required for optimal performance:

1. **Products Collection**:
   - Fields: `isFeatured`, `stock`, `__name__`
   - Used by: `getFeaturedProducts()`

2. **Orders Collection**:
   - Fields: `userId`, `createdAt`, `__name__`
   - Used by: `findByUserId()`
   - Fields: `status`, `createdAt`, `__name__`
   - Used by: `getOrdersByStatus()`

### Creating Indexes

Indexes are automatically suggested by Firestore when running queries. Follow the provided links in error messages to create required indexes.

## Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Cart subcollection
      match /cart/{cartItemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Products are readable by all authenticated users
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Orders are accessible by the user who created them
    match /orders/{orderId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Environment Configuration

Required environment variables:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/service-account.json
NODE_ENV=development|production
```

## Migration and Versioning

### Database Schema Versioning

- Each repository includes version information
- Migration scripts for schema changes
- Backward compatibility considerations

### Future Enhancements

- [ ] Caching layer implementation
- [ ] Advanced search with Algolia integration
- [ ] Real-time subscriptions
- [ ] Bulk operations optimization
- [ ] Advanced analytics

## Contributing

When adding new repositories:

1. Follow the existing repository pattern
2. Include comprehensive JSDoc documentation
3. Add proper TypeScript interfaces
4. Implement error handling
5. Add unit tests
6. Update this documentation

## Support

For questions or issues:

- Check the test files for usage examples
- Review Firebase Firestore documentation
- Check TypeScript interfaces in the models folder
- Run the test suite to verify functionality

---

**Last Updated**: September 2025  
**Version**: 1.0.0  
**Authors**: MG Mart Development Team

This comprehensive documentation covers all aspects of your repositories folder, including:

1. **Overview and Architecture** - Explains the repository pattern and benefits
2. **Detailed Repository Documentation** - Each repository with methods and use cases
3. **Data Flow and Usage Examples** - How to use the repositories
4. **Error Handling and Testing** - Quality assurance information
5. **Performance and Security** - Production considerations
6. **Configuration and Setup** - Environment requirements
7. **Future Enhancements** - Roadmap for improvements

The documentation is structured to be useful for both new developers joining the project and as a reference for existing team members.
