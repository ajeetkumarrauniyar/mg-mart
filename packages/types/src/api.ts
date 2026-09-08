/**
 * Shared API types for MG Mart grocery application
 *
 * This module defines common API response patterns, error handling types,
 * and pagination structures used consistently across all API endpoints.
 * Ensures standardized communication between frontend and backend.
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

/**
 * Standardized API response wrapper for all endpoints
 * Provides consistent response structure across the entire application
 *
 * @template T - Type of the response data
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * API error structure for detailed error information
 * Used for providing specific error details to client applications
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Pagination parameters for list endpoints
 * Used for implementing cursor-based or offset-based pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response structure for list endpoints
 * Includes data array and comprehensive pagination metadata
 *
 * @template T - Type of the items in the data array
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Sorting parameters for list endpoints
 * Used for ordering results by specific fields
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
