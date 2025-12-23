import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../constants';
import {
    getCurrentLocation,
    isWithinDeliveryRadius,
    SHOP_COORDINATES,
    MAX_DELIVERY_RADIUS,
    getSavedLocation,
    saveLocation,
} from '../utils';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const LocationSelectionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [selectedZone, setSelectedZone] = useState('Banasree');
    const [selectedArea, setSelectedArea] = useState('');
    const [manualLat, setManualLat] = useState('');
    const [manualLon, setManualLon] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [statusMessage, setStatusMessage] = useState<{
        text: string;
        type: 'success' | 'error' | 'info' | null;
    }>({ text: '', type: null });

    const zones = ['Banasree', 'Jahingara', 'Nearby Areas'];
    const areas = {
        'Banasree': ['Central Banasree', 'North Banasree', 'South Banasree'],
        'Jahingara': ['Main Market', 'Residential Area', 'Commercial Zone'],
        'Nearby Areas': ['Within 5km radius'],
    };

    // Load saved location on mount
    useEffect(() => {
        loadSavedLocation();
    }, []);

    const loadSavedLocation = async () => {
        const saved = await getSavedLocation();
        if (saved) {
            setCurrentLocation(saved);
            const { isWithinRadius, distance } = isWithinDeliveryRadius(
                saved.latitude,
                saved.longitude
            );
            if (isWithinRadius) {
                setStatusMessage({
                    text: `✅ Saved location found! You are ${distance}km away.`,
                    type: 'success',
                });
            }
        }
    };

    const handleGetCurrentLocation = async () => {
        setIsLoadingLocation(true);
        setStatusMessage({ text: '', type: null });
        
        try {
            const location = await getCurrentLocation();
            if (location) {
                setCurrentLocation(location);
                const { isWithinRadius, distance } = isWithinDeliveryRadius(
                    location.latitude,
                    location.longitude
                );

                if (isWithinRadius) {
                    // Auto-save and navigate back - no alert needed!
                    await saveLocation(location);
                    setStatusMessage({
                        text: `✅ Location confirmed! You are ${distance}km away.`,
                        type: 'success',
                    });
                    
                    // Auto-navigate after 1 second
                    setTimeout(() => {
                        navigation.goBack();
                    }, 1000);
                } else {
                    setStatusMessage({
                        text: `❌ You are ${distance}km away. We only deliver within ${MAX_DELIVERY_RADIUS}km radius.`,
                        type: 'error',
                    });
                }
            } else {
                setStatusMessage({
                    text: '⚠️ Location permission denied. Please enable location access in settings or enter coordinates manually.',
                    type: 'error',
                });
            }
        } catch (error) {
            setStatusMessage({
                text: '❌ Failed to get location. Please check GPS is enabled or enter coordinates manually.',
                type: 'error',
            });
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleManualLocationSubmit = async () => {
        const lat = parseFloat(manualLat);
        const lon = parseFloat(manualLon);

        if (isNaN(lat) || isNaN(lon)) {
            setStatusMessage({
                text: '❌ Please enter valid latitude and longitude values.',
                type: 'error',
            });
            return;
        }

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            setStatusMessage({
                text: '❌ Latitude must be between -90 and 90, longitude between -180 and 180.',
                type: 'error',
            });
            return;
        }

        const { isWithinRadius, distance } = isWithinDeliveryRadius(lat, lon);

        if (isWithinRadius) {
            const location = { latitude: lat, longitude: lon };
            setCurrentLocation(location);
            await saveLocation(location);
            setStatusMessage({
                text: `✅ Location confirmed! You are ${distance}km away.`,
                type: 'success',
            });
            
            // Auto-navigate after 1 second
            setTimeout(() => {
                navigation.goBack();
            }, 1000);
        } else {
            setStatusMessage({
                text: `❌ You are ${distance}km away. We only deliver within ${MAX_DELIVERY_RADIUS}km radius.`,
                type: 'error',
            });
        }
    };

    const handleSubmit = async () => {
        if (manualLat && manualLon) {
            handleManualLocationSubmit();
        } else if (currentLocation) {
            const { isWithinRadius, distance } = isWithinDeliveryRadius(
                currentLocation.latitude,
                currentLocation.longitude
            );

            if (isWithinRadius) {
                await saveLocation(currentLocation);
                navigation.goBack();
            } else {
                setStatusMessage({
                    text: `❌ You are ${distance}km away. We only deliver within ${MAX_DELIVERY_RADIUS}km radius.`,
                    type: 'error',
                });
            }
        } else {
            setStatusMessage({
                text: '⚠️ Please get your current location or enter coordinates manually.',
                type: 'info',
            });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Map Icon */}
            <View style={styles.mapContainer}>
                <View style={styles.mapIcon}>
                    <Ionicons name="location" size={40} color={COLORS.white} />
                </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Select Your Location</Text>
            <Text style={styles.subtitle}>
                Switch on your location to stay in tune with what's happening in your area
            </Text>

            {/* Status Message */}
            {statusMessage.text ? (
                <View style={[
                    styles.statusMessage,
                    statusMessage.type === 'success' && styles.statusSuccess,
                    statusMessage.type === 'error' && styles.statusError,
                    statusMessage.type === 'info' && styles.statusInfo,
                ]}>
                    <Text style={styles.statusText}>{statusMessage.text}</Text>
                </View>
            ) : null}

            {/* Current Location Button */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={handleGetCurrentLocation}
                disabled={isLoadingLocation}
                activeOpacity={0.8}
            >
                {isLoadingLocation ? (
                    <ActivityIndicator color={COLORS.primary} />
                ) : (
                    <Ionicons name="locate" size={20} color={COLORS.primary} />
                )}
                <Text style={styles.locationButtonText}>
                    {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
                </Text>
            </TouchableOpacity>

            {/* Manual Location Input */}
            <View style={styles.manualLocationContainer}>
                <Text style={styles.sectionTitle}>Or Enter Coordinates Manually</Text>
                <View style={styles.coordinateRow}>
                    <View style={styles.coordinateInput}>
                        <Text style={styles.inputLabel}>Latitude</Text>
                        <TextInput
                            style={styles.textInput}
                            value={manualLat}
                            onChangeText={setManualLat}
                            placeholder="26.48872"
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>
                    <View style={styles.coordinateInput}>
                        <Text style={styles.inputLabel}>Longitude</Text>
                        <TextInput
                            style={styles.textInput}
                            value={manualLon}
                            onChangeText={setManualLon}
                            placeholder="84.98157"
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>
            </View>

            {/* Zone Selection */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Your Zone</Text>
                <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>{selectedZone}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
            </View>

            {/* Area Selection */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Your Area</Text>
                <View style={styles.dropdown}>
                    <Text style={[styles.dropdownText, !selectedArea && styles.placeholder]}>
                        {selectedArea || 'Types of your area'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
            </View>

            {/* Delivery Info */}
            <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryInfoText}>
                    📍 We deliver within {MAX_DELIVERY_RADIUS}km radius from Jahingara, Bihar
                </Text>
                <Text style={styles.shopLocation}>
                    Shop Location: {SHOP_COORDINATES.latitude.toFixed(6)}, {SHOP_COORDINATES.longitude.toFixed(6)}
                </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
            >
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    mapIcon: {
        width: 120,
        height: 120,
        backgroundColor: COLORS.primary,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: SIZES.padding,
        marginBottom: 40,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    locationButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 8,
    },
    manualLocationContainer: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
    },
    coordinateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    coordinateInput: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionContainer: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    dropdownText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    placeholder: {
        color: '#999',
    },
    deliveryInfo: {
        backgroundColor: '#e3f2fd',
        marginHorizontal: SIZES.padding,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    deliveryInfoText: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: '500',
        marginBottom: 4,
    },
    shopLocation: {
        fontSize: 12,
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        marginHorizontal: SIZES.padding,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    statusMessage: {
        marginHorizontal: SIZES.padding,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    statusSuccess: {
        backgroundColor: '#d4edda',
        borderLeftWidth: 4,
        borderLeftColor: '#28a745',
    },
    statusError: {
        backgroundColor: '#f8d7da',
        borderLeftWidth: 4,
        borderLeftColor: '#dc3545',
    },
    statusInfo: {
        backgroundColor: '#d1ecf1',
        borderLeftWidth: 4,
        borderLeftColor: '#17a2b8',
    },
    statusText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
    },
});

export default LocationSelectionScreen;