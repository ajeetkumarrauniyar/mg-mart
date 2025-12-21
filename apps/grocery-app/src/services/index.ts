// Export all services
export { api, tokenManager, type ApiResponse, type ApiError } from "./apiService";
export {
  authService,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type RefreshTokenResponse,
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
export {
  orderService,
  type CreateOrderRequest,
  type OrdersListResponse,
  type ShippingAddress,
} from "./orderService";
export {
  userService,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
} from "./userService";

// Re-export default exports for convenience
export { default as apiClient } from "./apiService";
export { default as authServiceDefault } from "./authService";
export { default as productServiceDefault } from "./productsService";
export { default as cartServiceDefault } from "./cartService";
export { default as orderServiceDefault } from "./orderService";
export { default as userServiceDefault } from "./userService";
