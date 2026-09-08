// Export all services
export { api, tokenManager } from "./apiService";
export { default } from "./apiService";
export { authService } from "./authService";
export { dashboardService } from "./dashboardService";
export { productService } from "./productService";
export { orderService } from "./orderService";
export { userService } from "./userService";
export { imageManagementService } from "./imageManagementService";
export { categorySyncQueueService } from "./categorySyncQueueService";

// Export types
export type { ApiResponse, ApiError } from "./apiService";
export type { LoginCredentials, AuthResponse, AdminUser } from "./authService";
export type {
    DashboardStats,
    RecentOrder,
    TopProduct,
    AnalyticsData
} from "./dashboardService";
export type {
    Product,
    CreateProductData,
    UpdateProductData,
    ProductListResponse,
    ProductFilters
} from "./productService";
export type {
    Order,
    OrderItem,
    Address,
    OrderStatus,
    OrderListResponse,
    OrderFilters,
    OrderAnalytics,
    OrderStats
} from "./orderService";
export type {
    User,
    UserListResponse,
    UpdateUserData
} from "./userService";
export type {
    ProductImage,
    DiscoveredImage,
    DisplayImage,
    DiscoverImagesResponse,
    ProcessingStatusResponse,
    ApproveImagesPayload,
    SetPrimaryImageResponse,
    ImageManagementStatistics,
    ImageManagementHealth,
    CleanupResponse
} from "./imageManagementService";
export { buildDisplayImages } from "./imageManagementService";
export type { CategorySyncConflict } from "./categorySyncQueueService";