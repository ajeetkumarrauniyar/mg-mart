import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Shop coordinates in Jahingara, Bihar
export const SHOP_COORDINATES = {
    latitude: 26.48872183999999,
    longitude: 84.98157500999997,
};

// Maximum delivery radius in kilometers
export const MAX_DELIVERY_RADIUS = 5;

// Storage keys
const LOCATION_STORAGE_KEY = "@mg_mart_saved_location";

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Check if customer location is within delivery radius
 * @param customerLat Customer's latitude
 * @param customerLon Customer's longitude
 * @returns Object with isWithinRadius boolean and distance
 */
export function isWithinDeliveryRadius(
    customerLat: number,
    customerLon: number
): { isWithinRadius: boolean; distance: number } {
    const distance = calculateDistance(
        SHOP_COORDINATES.latitude,
        SHOP_COORDINATES.longitude,
        customerLat,
        customerLon
    );

    return {
        isWithinRadius: distance <= MAX_DELIVERY_RADIUS,
        distance,
    };
}

/**
 * Check if location permission is already granted
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking location permission:", error);
    return false;
  }
}

/**
 * Get user's current location using Expo Location
 * Checks permission status first before requesting
 */
export async function getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
} | null> {
  try {
    // Check if permission is already granted
    let { status } = await Location.getForegroundPermissionsAsync();

    // Only request if not already granted
    if (status !== "granted") {
      const permissionResult =
        await Location.requestForegroundPermissionsAsync();
      status = permissionResult.status;
    }

    if (status !== "granted") {
      console.log("Location permission denied");
      return null;
    }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 1,
        });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Save location for future use
    await saveLocation(coords);

    return coords;
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

/**
 * Save location to AsyncStorage
 */
export async function saveLocation(location: {
  latitude: number;
  longitude: number;
}): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch (error) {
    console.error("Error saving location:", error);
  }
}

/**
 * Get saved location from AsyncStorage
 */
export async function getSavedLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const saved = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error("Error getting saved location:", error);
    return null;
  }
}

/**
 * Clear saved location
 */
export async function clearSavedLocation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing saved location:", error);
  }
}
