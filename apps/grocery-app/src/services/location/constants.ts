// Constants for location-based ordering system

// Distance thresholds (in kilometers)
export const DISTANCE_THRESHOLDS = {
    APPROVED: 5,      // Orders approved within 5km
    WARNING: 7,       // Warning zone between 5-7km
    BLOCKED: 7,       // Orders blocked beyond 7km
} as const;

// GPS accuracy thresholds (in meters)
export const ACCURACY_THRESHOLDS = {
    EXCELLENT: 10,    // Excellent accuracy
    GOOD: 50,         // Good accuracy
    ACCEPTABLE: 100,  // Acceptable accuracy threshold
    POOR: 500,        // Poor accuracy
    UNACCEPTABLE: 1000, // Unacceptable accuracy
} as const;

// Location fetch timeouts (in milliseconds)
export const LOCATION_TIMEOUTS = {
    QUICK_FETCH: 10000,   // 10 seconds for quick location
    NORMAL_FETCH: 30000,  // 30 seconds for normal location
    EXTENDED_FETCH: 60000, // 60 seconds for extended location
} as const;

// Cache settings
export const CACHE_SETTINGS = {
    LOCATION_MAX_AGE: 5 * 60 * 1000,     // 5 minutes in milliseconds
    VALIDATION_CACHE_SIZE: 50,           // Maximum validation records to cache
    PERMISSION_CHECK_INTERVAL: 60000,    // Check permission status every minute
} as const;

// Retry settings
export const RETRY_SETTINGS = {
    MAX_LOCATION_RETRIES: 3,
    MAX_API_RETRIES: 3,
    RETRY_DELAY_BASE: 1000,              // Base delay for exponential backoff
    RETRY_DELAY_MAX: 10000,              // Maximum retry delay
} as const;

// User messages
export const USER_MESSAGES = {
    PERMISSION_REQUIRED: 'Location access is required for delivery validation. Please enable location services.',
    LOCATION_FETCHING: 'Getting your location...',
    LOCATION_POOR_ACCURACY: 'Improving location accuracy...',
    ORDER_APPROVED: 'Order approved! You are within our delivery area.',
    ORDER_WARNING: 'You seem to be a bit far from the store. Please confirm your location.',
    ORDER_BLOCKED: 'You appear to be outside our delivery area. Please refresh your location or contact store.',
    LOCATION_REFRESH_SUCCESS: 'Location updated successfully.',
    LOCATION_UPDATE_REQUIRED: 'Please update your delivery location to continue.',
} as const;

// Storage keys
export const STORAGE_KEYS = {
    USER_LOCATION: '@mg_mart_user_location',
    VALIDATION_CACHE: '@mg_mart_validation_cache',
    PERMISSION_STATUS: '@mg_mart_permission_status',
    LAST_LOCATION_FETCH: '@mg_mart_last_location_fetch',
} as const;

// API endpoints
export const API_ENDPOINTS = {
    VALIDATE_LOCATION: '/location/validate',
    CREATE_LOCATION: '/location/create',
    UPDATE_LOCATION: '/location/update',
    LOCATION_AUDIT: '/location/audit',
} as const;

// Device info
export const DEVICE_INFO = {
    PLATFORM: 'react-native',
    VERSION: '1.0.0',
} as const;