// Jest setup file for location-based ordering tests
import 'react-native-gesture-handler/jestSetup';

// Mock expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    LocationAccuracy: {
        Highest: 6,
        High: 4,
        Balanced: 3,
        Low: 2,
        Lowest: 1,
    },
    PermissionStatus: {
        GRANTED: 'granted',
        DENIED: 'denied',
        UNDETERMINED: 'undetermined',
    },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Silence console warnings during tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};