// Export all services
export { api, tokenManager, type ApiResponse, type ApiError } from "./api";
export {
  authService,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
} from "./auth";
export {
  productService,
  type ProductFilters,
  type ProductsResponse,
} from "./products";
export {
  cartService,
  type AddToCartRequest,
  type UpdateCartItemRequest,
} from "./cart";

// Re-export default exports for convenience
export { default as apiClient } from "./api";
export { default as authServiceDefault } from "./auth";
export { default as productServiceDefault } from "./products";
export { default as cartServiceDefault } from "./cart";
