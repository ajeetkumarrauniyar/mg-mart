/**
 * Shared TypeScript types for MG Mart grocery application
 * 
 * This package provides consistent type definitions shared across
 * the entire monorepo including mobile app, admin panel, and backend.
 * 
 * ERP-centric design: BUSY ERP is the source of truth for inventory.
 * 
 * @author MG Mart Development Team
 * @version 2.0.0
 */

// User management types
export * from './user.js';

// Product catalog types (ERP-synced)
export * from './product.js';

// Shopping cart types
export * from './cart.js';

// Order processing types
export * from './order.js';

// Store configuration and delivery types
export * from './store.js';

// Notification types (FCM)
export * from './notification.js';

// ERP sync types
export * from './erp-sync.js';

// Common API types
export * from './api.js';
