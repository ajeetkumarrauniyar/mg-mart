import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '@/constants';

export interface AddressSectionProps {
  locationName: string;
  locationStatus: 'unknown' | 'checking' | 'valid' | 'invalid';
  isValidating: boolean;
  errorText?: string | null;
  onVerify: () => void;
  onChangeAddress: () => void;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  locationName,
  locationStatus,
  isValidating,
  errorText,
  onVerify,
  onChangeAddress,
}) => (
  <View style={addrStyles.container}>
    <View style={addrStyles.header}>
      <View style={addrStyles.titleRow}>
        <Ionicons name="location" size={20} color={COLORS.primary} />
        <Text style={addrStyles.heading}>Delivery address</Text>
      </View>
      <TouchableOpacity onPress={onChangeAddress}>
        <Text style={addrStyles.changeBtn}>Change</Text>
      </TouchableOpacity>
    </View>

    <Text style={addrStyles.address} numberOfLines={2}>
      {locationName || 'No address set'}
    </Text>

    {locationStatus === 'invalid' && errorText ? (
      <View style={addrStyles.errorBox}>
        <Ionicons name="warning" size={16} color={COLORS.error} />
        <Text style={addrStyles.errorText}>{errorText}</Text>
      </View>
    ) : locationStatus !== 'valid' && (
      <TouchableOpacity
        style={addrStyles.verifyBtn}
        onPress={onVerify}
        disabled={isValidating}
      >
        {isValidating ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
            <Text style={addrStyles.verifyText}>Verify delivery location</Text>
          </>
        )}
      </TouchableOpacity>
    )}
  </View>
);

const addrStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontSize: SIZES.fontSize.large,
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
  },
  changeBtn: {
    fontSize: SIZES.fontSize.medium,
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.primary,
  },
  address: {
    fontSize: SIZES.fontSize.medium,     // 15px (was 14px)
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadius,
  },
  verifyText: {
    fontSize: SIZES.fontSize.small,
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadiusSmall,
    marginTop: 4,
  },
  errorText: {
    fontSize: SIZES.fontSize.small,
    fontWeight: SIZES.fontWeight.medium,
    color: COLORS.error,
    flex: 1,
  },
});
