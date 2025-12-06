// Export all services
export { api, tokenManager, type ApiResponse, type ApiError } from "./apiService";
export {
  authService,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
} from "./authService";
export {
  productService,
  type ProductFilters,
  type ProductsResponse,
} from "./productsService";
export {
  cartService,
  type AddToCartRequest,
  type UpdateCartItemRequest,
} from "./cartService";

// Re-export default exports for convenience
export { default as apiClient } from "./apiService";
export { default as authServiceDefault } from "./authService";
export { default as productServiceDefault } from "./productsService";
export { default as cartServiceDefault } from "./cartService";
