import { create } from 'zustand';
import { locationService } from '../services/location/LocationService';
import type { LocationData, LocationCoordinates } from '../services/location/types';

interface LocationState {
    // State
    currentLocation: LocationCoordinates | null;
    savedLocation: LocationData | null;
    locationName: string;
    isLoading: boolean;
    error: string | null;
    hasPermission: boolean;

    // Actions
    getCurrentLocation: () => Promise<void>;
    getSavedLocation: () => Promise<void>;
    updateLocationName: (name: string) => void;
    refreshLocation: () => Promise<void>;
    clearError: () => void;
    initializeLocation: () => Promise<void>;
    reverseGeocode: (coordinates: LocationCoordinates) => Promise<void>;
    getCurrentLocationName: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
    // Initial state
    currentLocation: null,
    savedLocation: null,
    locationName: 'Select Location',
    isLoading: false,
    error: null,
    hasPermission: false,

    // Get current GPS location
    getCurrentLocation: async () => {
        set({ isLoading: true, error: null });
        try {
            const location = await locationService.getCurrentLocation();
            set({
                currentLocation: location,
                isLoading: false,
                hasPermission: true
            });

            // Try to reverse geocode to get location name
            await get().reverseGeocode(location);
        } catch (error) {
            console.error('Failed to get current location:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to get location',
                isLoading: false,
                hasPermission: false
            });
        }
    },

    // Get saved location from storage
    getSavedLocation: async () => {
        set({ isLoading: true, error: null });
        try {
            const savedLocationData = await locationService.getStoredLocation();
            if (savedLocationData) {
                set({
                    savedLocation: savedLocationData,
                    locationName: savedLocationData.deliveryAddress || 'Saved Location',
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to get saved location:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to get saved location',
                isLoading: false
            });
        }
    },

    // Update location name manually
    updateLocationName: (name: string) => {
        set({ locationName: name });
    },

    // Refresh current location
    refreshLocation: async () => {
        set({ isLoading: true, error: null });
        try {
            const location = await locationService.refreshLocation();
            set({
                currentLocation: location,
                isLoading: false,
                hasPermission: true
            });

            // Try to reverse geocode to get location name
            await get().reverseGeocode(location);
        } catch (error) {
            console.error('Failed to refresh location:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to refresh location',
                isLoading: false
            });
        }
    },

    // Clear error state
    clearError: () => {
        set({ error: null });
    },

    // Initialize location on app start
    initializeLocation: async () => {
        console.log('Initializing location...');
        set({ isLoading: true });

        try {
            // First try to get saved location (no permission needed)
            await get().getSavedLocation();

            const { savedLocation } = get();
            if (savedLocation) {
                console.log('Found saved location, reverse geocoding...');
                // If we have saved location, reverse geocode it to get current name
                await get().reverseGeocode(savedLocation.coordinates);
                set({ isLoading: false });
            } else {
                console.log('No saved location found');
                set({
                    isLoading: false,
                    locationName: 'Select Location'
                });
            }
        } catch (error) {
            console.error('Failed to initialize location:', error);
            set({
                error: 'Failed to get location',
                isLoading: false,
                locationName: 'Select Location'
            });
        }
    },

    // Get current location name (force refresh)
    getCurrentLocationName: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log('Getting current location name...');
            const location = await locationService.getCurrentLocation();
            set({ currentLocation: location, hasPermission: true });
            await get().reverseGeocode(location);
            set({ isLoading: false });
            console.log('✅ Location name updated successfully');
        } catch (error) {
            console.error('Failed to get current location name:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to get location name',
                isLoading: false,
                locationName: 'Location unavailable'
            });
        }
    },

    // Helper method to reverse geocode coordinates to location name
    reverseGeocode: async (coordinates: LocationCoordinates) => {
        try {
            // Using a free reverse geocoding service
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&localityLanguage=en`
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Reverse geocoding response:', data);

                // Try to build a meaningful location name
                let locationName = '';

                if (data.city) {
                    locationName = data.city;
                    if (data.principalSubdivision && data.principalSubdivision !== data.city) {
                        locationName += `, ${data.principalSubdivision}`;
                    }
                } else if (data.locality) {
                    locationName = data.locality;
                    if (data.principalSubdivision) {
                        locationName += `, ${data.principalSubdivision}`;
                    }
                } else if (data.principalSubdivision) {
                    locationName = data.principalSubdivision;
                } else if (data.countryName) {
                    locationName = data.countryName;
                } else {
                    locationName = 'Current Location';
                }

                console.log('Setting location name:', locationName);
                set({ locationName });
            } else {
                console.warn('Reverse geocoding API error:', response.status);
                set({ locationName: 'Current Location' });
            }
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            // Try alternative approach with a different service
            try {
                const altResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=10&addressdetails=1`
                );

                if (altResponse.ok) {
                    const altData = await altResponse.json();
                    console.log('Alternative geocoding response:', altData);

                    const address = altData.address || {};
                    let locationName = '';

                    if (address.city || address.town || address.village) {
                        locationName = address.city || address.town || address.village;
                        if (address.state && address.state !== locationName) {
                            locationName += `, ${address.state}`;
                        }
                    } else if (address.state) {
                        locationName = address.state;
                    } else if (address.country) {
                        locationName = address.country;
                    } else {
                        locationName = 'Current Location';
                    }

                    console.log('Setting alternative location name:', locationName);
                    set({ locationName });
                } else {
                    set({ locationName: 'Current Location' });
                }
            } catch (altError) {
                console.warn('Alternative geocoding also failed:', altError);
                set({ locationName: 'Current Location' });
            }
        }
    },
}));