// Core location types and interfaces for the location-based ordering system

export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp: number;
}

export interface LocationData {
    id: string;
    userId: string;
    coordinates: LocationCoordinates;
    deliveryAddress: string;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface ValidationRecord {
    id: string;
    orderId?: string;
    currentLocation: LocationCoordinates;
    savedLocation: LocationCoordinates;
    distance: number;
    validationType: ValidationType;
    result: boolean;
    timestamp: number;
    deviceInfo?: DeviceInfo;
}

export interface LocationAction {
    type: 'REFRESH_LOCATION' | 'UPDATE_ADDRESS' | 'CONTACT_SUPPORT' | 'ENABLE_LOCATION';
    label: string;
    handler: () => void;
}

export interface LocationValidationResult {
    isValid: boolean;
    distance: number;
    validationType: ValidationType;
    message: string;
    suggestedActions: LocationAction[];
}

export interface ServiceAreaValidation {
    distance: number;
    status: 'WITHIN_AREA' | 'WARNING_ZONE' | 'OUTSIDE_AREA';
    threshold: number;
}

export interface LocationOptions {
    enableHighAccuracy: boolean;
    timeout: number;
    maximumAge: number;
    minimumAccuracy: number;
}

export interface DeviceInfo {
    platform: string;
    version: string;
    model?: string;
}

// Enums
export enum PermissionStatus {
    GRANTED = 'granted',
    DENIED = 'denied',
    NEVER_ASK_AGAIN = 'never_ask_again',
    UNDETERMINED = 'undetermined'
}

export enum ValidationType {
    APPROVED = 'APPROVED',      // ≤ 5km
    WARNING = 'WARNING',        // 5-7km  
    BLOCKED = 'BLOCKED'         // > 7km
}

// Storage interfaces
export interface LocalLocationStorage {
    userLocation: LocationData | null;
    validationCache: ValidationRecord[];
    permissionStatus: PermissionStatus;
    lastLocationFetch: number;
}

// API models
export interface CreateLocationRequest {
    coordinates: LocationCoordinates;
    deliveryAddress: string;
}

export interface ValidateLocationRequest {
    currentLocation: LocationCoordinates;
    orderId?: string;
}

export interface LocationValidationResponse {
    isValid: boolean;
    distance: number;
    validationType: ValidationType;
    message: string;
}