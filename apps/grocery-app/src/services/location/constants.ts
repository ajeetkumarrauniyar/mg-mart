// Constants for location-based ordering system

// Distance thresholds (in kilometers)
export const DISTANCE_THRESHOLDS = {
    APPROVED: 3,      // Orders approved within 3km (tightened from 5km)
    WARNING: 5,       // Warning zone between 3-5km (tightened from 5-7km)
    BLOCKED: 5,       // Orders blocked beyond 5km (tightened from 7km)
} as const;

// GPS accuracy thresholds (in meters)
export const ACCURACY_THRESHOLDS = {
    EXCELLENT: 5,     // Excellent accuracy 
    GOOD: 20,         // Good accuracy  
    POOR: 100,        // Poor accuracy 
    UNACCEPTABLE: 200, // Unacceptable accuracy 
} as const;

// Location fetch timeouts (in milliseconds)
export const LOCATION_TIMEOUTS = {
    QUICK_FETCH: 15000,   // 15 seconds for quick location 
    NORMAL_FETCH: 45000,  // 45 seconds for normal location 
    EXTENDED_FETCH: 90000, // 90 seconds for extended location 
    HIGH_PRECISION: 120000, // 120 seconds for high precision location
} as const;

// Cache settings
export const CACHE_SETTINGS = {
    LOCATION_MAX_AGE: 2 * 60 * 1000,     // 2 minutes in milliseconds 
    VALIDATION_CACHE_SIZE: 50,           // Maximum validation records to cache
    PERMISSION_CHECK_INTERVAL: 60000,    // Check permission status every minute
    HIGH_ACCURACY_CACHE_AGE: 30 * 1000,  // 30 seconds for high accuracy locations
} as const;

// Retry settings
export const RETRY_SETTINGS = {
    MAX_LOCATION_RETRIES: 5,             // Increased from 3 to 5 retries
    MAX_API_RETRIES: 3,
    RETRY_DELAY_BASE: 2000,              // Base delay for exponential backoff (increased from 1s to 2s)
    RETRY_DELAY_MAX: 15000,              // Maximum retry delay (increased from 10s to 15s)
    MIN_ACCURACY_IMPROVEMENT: 10,        // Minimum accuracy improvement (in meters) to accept new reading
} as const;

// User messages
export const USER_MESSAGES = {
    PERMISSION_REQUIRED: 'Location access is required for delivery validation. Please enable location services.',
    LOCATION_FETCHING: 'Getting your precise location...',
    LOCATION_POOR_ACCURACY: 'Improving location accuracy for better precision...',
    ORDER_APPROVED: 'Perfect! You are within our 3km delivery zone.',
    ORDER_WARNING: 'You are 3-5km away from the store. Please confirm your location to proceed.',
    ORDER_BLOCKED: 'You appear to be beyond our 5km delivery area. Please refresh your location or update your delivery address.',
    LOCATION_REFRESH_SUCCESS: 'Location updated successfully with improved accuracy.',
    LOCATION_UPDATE_REQUIRED: 'Please update your delivery location to continue.',
    HIGH_ACCURACY_REQUIRED: 'For precise delivery, we need your exact location. Please ensure GPS is enabled.',
    ACCURACY_IMPROVING: 'Getting more precise location... Please wait.',
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