import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface LocationHeaderProps {
    address: string;
    isLoading?: boolean;
    onPress?: () => void;
    onProfilePress?: () => void;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({
    address,
    isLoading,
    onPress,
    onProfilePress,
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.locationSection} onPress={onPress}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Delivery to</Text>
                        <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
                    </View>
                    <View style={styles.addressRow}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
                        ) : (
                            <Text style={styles.address} numberOfLines={1}>
                                {address || 'Select a location'}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
                <View style={styles.profileIconContainer}>
                    <Ionicons name="person-circle" size={32} color={COLORS.primary} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: COLORS.white,
    },
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: SIZES.fontSize.tiny,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginRight: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 1,
    },
    address: {
        fontSize: SIZES.fontSize.medium,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        flex: 1,
    },
    loader: {
        height: 20,
        width: 20,
    },
    profileButton: {
        marginLeft: 15,
    },
    profileIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LocationHeader;
